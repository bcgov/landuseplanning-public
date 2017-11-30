import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Api } from './api';

import { Application } from '../models/application';

@Injectable()
export class ApplicationService {
  project: Application;

  constructor(private api: Api) { }

  getAll() {
    return this.api.getApplications()
      .map((res: Response) => {
        const projects = res.text() ? res.json() : [];

        projects.forEach((project, index) => {
          projects[index] = new Application(project);
        });

        return projects;
      })
      .catch(this.api.handleError);
  }
}
