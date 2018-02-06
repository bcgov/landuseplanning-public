import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { OrganizationService } from './organization.service';
import { CommentPeriodService } from './commentperiod.service';
import { Application } from 'app/models/application';
import { Organization } from 'app/models/Organization';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class ApplicationService {
  constructor(
    private api: ApiService,
    private organizationService: OrganizationService,
    private commentPeriodService: CommentPeriodService
  ) { }

  // get all applications
  getAll(): Observable<Application[]> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        applications.forEach((application, i) => {
          applications[i] = new Application(application);
        });
        return applications;
      })
      .map((applications: Array<Application>) => {
        if (applications.length === 0) {
          return Observable.of([]);
        }

        // for each application, get the proponent
        applications.forEach((application, i) => {
          if (applications[i]._proponent) {
            this.organizationService.getById(applications[i]._proponent).subscribe(
              organization => application.proponent = organization,
              error => console.log(error)
            );
          }
        });

        // for each application, get the comment periods and commenting status
        applications.forEach((application, i) => {
          this.commentPeriodService.getAllByApplicationId(applications[i]._id).subscribe(
            periods => {
              applications[i].periods = periods;
              applications[i].commentingStatus = this.commentPeriodService.getCommentingStatus(periods);
            },
            error => console.log(error)
          );
        });

        return applications;
      })
      .catch(this.api.handleError);
  }

  // get a specific application by its id
  getById(id: string): Observable<Application> {
    // first get the application data
    return this.api.getApplication(id)
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .map((application: Application) => {
        if (!application) { return null; }

        // get the proponent
        if (application._proponent) {
          this.organizationService.getById(application._proponent).subscribe(
            organization => application.proponent = organization,
            error => console.log(error)
          );
        }

        // get the comment periods and commenting status
        this.commentPeriodService.getAllByApplicationId(application._id).subscribe(
          periods => {
            application.periods = periods;
            application.commentingStatus = this.commentPeriodService.getCommentingStatus(periods);
          },
          error => console.log(error)
        );

        return application;
      })
      .catch(this.api.handleError);
  }
}
