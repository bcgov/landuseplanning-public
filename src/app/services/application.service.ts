import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from './api';
import { DocumentService } from './document.service';
import { OrganizationService } from './organization.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';

@Injectable()
export class ApplicationService {
  private application: Application = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private organizationService: OrganizationService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService
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
  // no need for catch statements since we're calling other services
  getAll(): Observable<Application[]> {
    // first get the applications
    return this.getAllInternal()
      .mergeMap((applications: Application[]) => {
        if (applications.length === 0) {
          return [];
        }

        const promises: Array<Promise<any>> = [];

        // now get the organization for each application
        applications.forEach((application, i) => {
          if (applications[i]._organization) {
            promises.push(this.organizationService.getById(applications[i]._organization)
              .toPromise()
              .then(organization => application.organization = organization));
          }
        });

        // now get the current comment period for each application
        applications.forEach((application, i) => {
          promises.push(this.commentPeriodService.getAllByApplicationId(applications[i]._id)
            .toPromise()
            .then(periods => applications[i].currentPeriod = this.commentPeriodService.getCurrent(periods)));
        });

        return Promise.all(promises).then(() => { return applications; });
      });
  }

  // get just the applications
  private getAllInternal(): Observable<Application[]> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        applications.forEach((application, i) => {
          applications[i] = new Application(application);
        });
        return applications;
      })
      .catch(this.api.handleError);
  }

  // get a specific application by its id
  getById(appId: string, forceReload: boolean = false): Observable<Application> {
    if (this.application && this.application._id === appId && !forceReload) {
      return Observable.of(this.application);
    }

    // first get the application data
    return this.api.getApplication(appId)
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .map((application: Application) => {
        if (!application) { return null; }

        // get the organization
        if (application._organization) {
          this.organizationService.getById(application._organization, forceReload).subscribe(
            organization => application.organization = organization,
            error => console.log(error)
          );
        }

        // get the documents
        this.documentService.getAllByApplicationId(application._id).subscribe(
          documents => this.application.documents = documents,
          error => console.log(error)
        );

        // get the current comment period
        this.commentPeriodService.getAllByApplicationId(application._id).subscribe(
          periods => application.currentPeriod = this.commentPeriodService.getCurrent(periods),
          error => console.log(error)
        );

        // get the decision
        this.decisionService.getByApplicationId(application._id, forceReload).subscribe(
          decision => this.application.decision = decision,
          error => console.log(error)
        );

        this.application = application;
        return this.application;
      })
      .catch(this.api.handleError);
  }

  // returns application status based on status code
  getStatus(application: Application): string {
    if (!application || !application.status) {
      return 'Unknown Application Status';
    }

    switch (application.status.toUpperCase()) {
      case 'ABANDONED': return 'Application Abandoned';
      case 'ACCEPTED': return 'Application Under Review';
      case 'ALLOWED': return 'Decision: Allowed';
      case 'DISALLOWED': return 'Decision: Not Approved';
      case 'DISPOSITION IN GOOD STANDING': return 'Tenure: Disposition in Good Standing';
      case 'OFFER ACCEPTED': return 'Decision: Offer Accepted';
      case 'OFFER NOT ACCEPTED': return 'Decision: Offer Not Accepted';
      case 'OFFERED': return 'Decision: Offered';
      case 'SUSPENDED': return 'Tenure: Suspended';
    }

    // return status in title case
    return _.startCase(_.camelCase(application.status));
  }
}
