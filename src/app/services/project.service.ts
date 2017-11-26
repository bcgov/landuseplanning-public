import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Api } from './api';

import { Project } from '../models/project';
import { Collection, CollectionsList } from '../models/collection';

@Injectable()
export class ProjectService {
  project: Project;

  constructor(private api: Api) { }

  getAll() {
    return this.api.getProjects()
      .map((res: Response) => {
        const projects = res.text() ? res.json() : [];

        projects.forEach((project, index) => {
          projects[index] = new Project(project);
        });

        return projects;
      })
      .catch(this.api.handleError);
  }

  getByCode(code: string): Observable<Project> {
    this.project = null;

    // Grab the project data first
    return this.api.getProjectByCode(code)
      .map((res: Response) => {
        return res.text() ? new Project(res.json()) : null;
      })
      .map((project: Project) => {
        if (!project) { return; }

        this.project = project;
        this.project.collections = new CollectionsList();

        // Now grab the MEM collections
        this.api.getProjectCollectionsMEM(this.project.code)
          .map((res: Response) => this.processCollections(res))
          .subscribe(memCollections => {
            // Push them into the project
            memCollections.forEach(collection => {
              this.addCollection(this.project.collections, collection);
            });
          });

        // Get EPIC collections next.
        // Note: there may be multiple (or no) EPIC projects associated with this MEM project.
        this.project.epicProjectCodes.forEach(epicProjectCode => {
          this.api.getProjectCollectionsEPIC(epicProjectCode)
            .map((res: Response) => this.processCollections(res))
            .subscribe(epicCollections => {
              // Push them into the project
              epicCollections.forEach(collection => {
                this.addCollection(this.project.collections, collection);
              });
            });
        });

        return this.project;
      })
      .catch(this.api.handleError);
  }

  private processCollections(res: Response) {
    const collections = res.text() ? res.json() : [];

    collections.forEach((collection, index) => {
      collections[index] = new Collection(collection);
    });

    return collections;
  }

  private addCollection(collectionsList: CollectionsList, collection: Collection) {
    switch (collection.parentType) {
      case 'Authorizations':
        collectionsList.authorizations[collection.agency].add(collection);
        break;
      case 'Compliance and Enforcement':
        collectionsList.compliance.add(collection);
        break;
      case 'Other':
        collectionsList.documents.add(collection);
        break;
    }
  }
}
