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
// import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';

@Injectable()
export class ApplicationService {
  public application: Application;

  constructor(
    private api: ApiService,
    private organizationService: OrganizationService,
    private documentService: DocumentService,
    // private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService
  ) { }

  // get all applications
  getAll(): Observable<Application[]> {
    return this.api.getApplications()
      .map((res: Response) => {
        const applications = res.text() ? res.json() : [];

        applications.forEach((application, index) => {
          applications[index] = new Application(application);

          // TODO: get the proponent for each application
          // ref: https://www.metaltoad.com/blog/angular-2-http-observables-and-concurrent-data-loading
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
        return applications.length > 0 ? applications[0] : null;
      })
      .map((application: Application) => {
        if (!application) { return; }

        // cache application
        this.application = new Application(application);

        // get the proponent
        if (application._proponent) {
          this.organizationService.getById(application._proponent)
            .subscribe(
            organization => {
              this.application.proponent = new Organization(organization);
            },
            error => console.log(error)
            );
        }

        // get the application documents
        this.documentService.getAllByApplicationId(application._id)
          .subscribe(
          documents => {
            documents.forEach(document => {
              this.application.documents.push(document);
            });
          },
          error => console.log(error)
          );

        // get the comment periods
        // this.commentPeriodService.getAllByApplicationId(application._id)
        //   .subscribe(
        //   periods => {
        //     console.log('periods=', periods);
        //     periods.forEach(period => {
        //       this.application.periods.push(period);
        //     });
        //     console.log('periods=', this.application.periods);
        //   },
        //   error => console.log(error)
        //   );

        return this.application;
      })
      .catch(this.api.handleError);
  }
}
