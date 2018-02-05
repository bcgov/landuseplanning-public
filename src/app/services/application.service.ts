import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Application } from 'app/models/application';
import { Organization } from 'app/models/organization';
import { Document } from 'app/models/document';
import { Decision } from 'app/models/decision';

import { ApiService } from './api';
import { OrganizationService } from './organization.service';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';

@Injectable()
export class ApplicationService {
  constructor(
    private api: ApiService,
    private organizationService: OrganizationService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService
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

        // get the proponent for each application
        applications.forEach((application, i) => {
          if (applications[i]._proponent) {
            this.organizationService.getById(applications[i]._proponent)
              .subscribe(
              organization => {
                applications[i].proponent = organization; // new Organization(organization);
              },
              error => console.log(error)
              );
          }
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
        if (!application) { return; }

        // get the proponent
        if (application._proponent) {
          this.organizationService.getById(application._proponent)
            .subscribe(
            organization => {
              application.proponent = organization; // new Organization(organization);
            },
            error => console.log(error)
            );
        }

        // get the application documents
        this.documentService.getAllByApplicationId(application._id)
          .subscribe(
          documents => {
            documents.forEach(document => {
              application.documents.push(document);
            });
          },
          error => console.log(error)
          );

        // get the comment periods
        // TODO: what we really want is the current or future comment period
        // if current then commenting is OPEN
        // if future then commenting is SCHEDULED
        // otherwise, commenting is CLOSED
        this.commentPeriodService.getAllByApplicationId(application._id)
          .subscribe(
          periods => {
            periods.forEach(period => {
              application.periods.push(period);
            });
          },
          error => console.log(error)
          );

        // get the decision
        if (application._decision) {
          this.decisionService.getById(application._decision)
            .subscribe(
            decision => {
              application.decision = decision; // new Decision(decision);
            },
            error => console.log(error)
            );
        }

        return application;
      })
      .catch(this.api.handleError);
  }
}
