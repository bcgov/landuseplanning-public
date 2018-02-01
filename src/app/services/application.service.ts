import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { OrganizationService } from './organization.service';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';
import { Application } from 'app/models/application';
// import { CollectionsList } from 'app/models/collection';

@Injectable()
export class ApplicationService {
  public application: Application;

  constructor(
    private api: ApiService,
    private organizationService: OrganizationService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService
  ) { }

  getAll(): Observable<Application[]> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];

        applications.forEach((application, index) => {
          applications[index] = new Application(application);
        });

        return applications;
      })
      .catch(this.api.handleError);
  }

  getById(id: string): Observable<Application> {
    // first get the application data
    return this.api.getApplication(id)
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? applications[0] : null;
      })
      .map((application: Application) => {
        // if (!application) { return; }

        // get the proponent
        if (application._proponent) {
          this.organizationService.getById(application._proponent)
            .subscribe(
            organization => this.application.proponent = organization,
            error => console.log(error)
            );
        }

        // get the documents
        this.documentService.getAllByApplicationId(application._id)
          .subscribe(
          documents => this.application.documents = documents,
          error => console.log(error)
          );

        // get the comment periods

        // get the comments (for the current period)

        // get the decision
        if (application._decision) {
          this.organizationService.getById(application._decision)
            .subscribe(
            decision => this.application.decision = decision,
            error => console.log(error)
            );
        }

        // this.application.collections = new CollectionsList();

        // // Now grab the MEM collections
        // this.api.getProjectCollectionsMEM(this.project.code)
        //   .map((res: Response) => this.processCollections(res))
        //   .subscribe(memCollections => {
        //     // Push them into the project
        //     memCollections.forEach(collection => {
        //       this.addCollection(this.project.collections, collection);
        //     });
        //   });

        // // Get EPIC collections next.
        // // Note: there may be multiple (or no) EPIC projects associated with this MEM project.
        // this.project.epicProjectCodes.forEach(epicProjectCode => {
        //   this.api.getProjectCollectionsEPIC(epicProjectCode)
        //     .map((res: Response) => this.processCollections(res))
        //     .subscribe(epicCollections => {
        //       // Push them into the project
        //       epicCollections.forEach(collection => {
        //         this.addCollection(this.project.collections, collection);
        //       });
        //     });
        // });

        // cache application
        this.application = application;

        return this.application;
      })
      .catch(this.api.handleError);
  }
}
