import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { OrganizationService } from './organization.service';
import { CommentPeriodService } from './commentperiod.service';
import { Application } from 'app/models/application';

@Injectable()
export class ApplicationService {
  constructor(
    private api: ApiService,
    private organizationService: OrganizationService,
    private commentPeriodService: CommentPeriodService
  ) { }

  // get count of applications
  getCount(): Observable<number> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        return applications.length;
      })
      .catch(this.api.handleError);
  }

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
          return Observable.of([]); // TODO: return null?
        }

        // now get the proponent for each application
        applications.forEach((application, i) => {
          if (applications[i]._proponent) {
            this.organizationService.getById(applications[i]._proponent).subscribe(
              organization => application.proponent = organization,
              error => console.log(error)
            );
          }
        });

        // now get the current comment period for each application
        applications.forEach((application, i) => {
          this.commentPeriodService.getAllByApplicationId(applications[i]._id).subscribe(
            periods => applications[i].currentPeriod = this.commentPeriodService.getCurrent(periods),
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

        // get the current comment period
        this.commentPeriodService.getAllByApplicationId(application._id).subscribe(
          periods => application.currentPeriod = this.commentPeriodService.getCurrent(periods),
          error => console.log(error)
        );

        return application;
      })
      .catch(this.api.handleError);
  }

  // returns application status based on stage code + status code
  getStatus(application: Application): string {
    if (!application || !application.stageCode || !application.status) {
      return null; // error
    }

    if (application.stageCode === 'A') {
      switch (application.status.toUpperCase()) {
        case 'ABANDONED': return 'Application Abandoned';
        case 'ACCEPTED': return 'Application Under Review';
        case 'ALLOWED': return 'Decision Made: Allowed';
        case 'DISALLOWED': return 'Decision Made: Disallowed';
        case 'OFFERED': return 'Decision Made: Offered';
        case 'OFFER ACCEPTED': return 'Decision Made: Offer Accepted';
        case 'OFFER NOT ACCEPTED': return 'Decision Made: Offer Not Accepted';
      }
    } else if (application.stageCode === 'T') {
      switch (application.status.toUpperCase()) {
        case 'DISPOSITION IN GOOD STANDING': return 'Tenure: Disposition in Good Standing';
        case 'SUSPENDED': return 'Tenure: Suspended';
      }
    }
    return null; // unknown status
  }
}
