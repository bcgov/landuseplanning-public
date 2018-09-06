import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApiService } from './api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';
import { SearchService } from './search.service';
import { FeatureService } from './feature.service';

@Injectable()
export class ApplicationService {
  //#region Constants
  // statuses / query param options
  readonly ABANDONED = 'AB';
  readonly ACCEPTED = 'AC';
  readonly ALLOWED = 'AL';
  readonly CANCELLED = 'CA';
  readonly DISALLOWED = 'DI';
  readonly DISPOSITION_GOOD_STANDING = 'DG';
  readonly OFFER_ACCEPTED = 'OA';
  readonly OFFER_NOT_ACCEPTED = 'ON';
  readonly OFFERED = 'OF';
  readonly SUSPENDED = 'SU';
  // special combination status (see isDecision below)
  readonly DECISION_MADE = 'DE';
  // special status when no data
  readonly UNKNOWN = 'UN';

  // regions / query param options
  readonly CARIBOO = 'CA';
  readonly KOOTENAY = 'KO';
  readonly LOWER_MAINLAND = 'LM';
  readonly OMENICA = 'OM';
  readonly PEACE = 'PE';
  readonly SKEENA = 'SK';
  readonly SOUTHERN_INTERIOR = 'SI';
  readonly VANCOUVER_ISLAND = 'VI';
  //#endregion

  // use helpers to get these
  private applicationStatuses: Array<string> = [];
  private regions: Array<string> = [];

  private application: Application = null; // for caching

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService,
    private searchService: SearchService,
    private featureService: FeatureService
  ) {
    // user-friendly strings for display
    this.applicationStatuses[this.ABANDONED] = 'Application Abandoned';
    this.applicationStatuses[this.ACCEPTED] = 'Application Under Review';
    this.applicationStatuses[this.ALLOWED] = 'Decision: Allowed';
    this.applicationStatuses[this.CANCELLED] = 'Application Cancelled';
    this.applicationStatuses[this.DISALLOWED] = 'Decision: Not Approved';
    this.applicationStatuses[this.DISPOSITION_GOOD_STANDING] = 'Tenure: Disposition in Good Standing';
    this.applicationStatuses[this.OFFER_ACCEPTED] = 'Decision: Offer Accepted';
    this.applicationStatuses[this.OFFER_NOT_ACCEPTED] = 'Decision: Offer Not Accepted';
    this.applicationStatuses[this.OFFERED] = 'Decision: Offered';
    this.applicationStatuses[this.SUSPENDED] = 'Tenure: Suspended';
    this.applicationStatuses[this.DECISION_MADE] = 'Decision Made';
    this.applicationStatuses[this.UNKNOWN] = 'Unknown Application Status';

    this.regions[this.CARIBOO] = 'Cariboo, Williams Lake';
    this.regions[this.KOOTENAY] = 'Kootenay, Cranbrook';
    this.regions[this.LOWER_MAINLAND] = 'Lower Mainland, Surrey';
    this.regions[this.OMENICA] = 'Omenica/Peace, Prince George';
    this.regions[this.PEACE] = 'Peace, Ft. St. John';
    this.regions[this.SKEENA] = 'Skeena, Smithers';
    this.regions[this.SOUTHERN_INTERIOR] = 'Thompson Okanagan, Kamloops';
    this.regions[this.VANCOUVER_ISLAND] = 'West Coast, Nanaimo';
  }

  // get count of applications
  // FUTURE: use dedicated API for this because we don't need any data
  getCount(): Observable<number> {
    return this.getAllInternal()
      .map(applications => {
        return applications.length;
      })
      .catch(this.api.handleError);
  }

  // get all applications
  // TODO: instead of using promises to get all data at once, use observables and DEEP-OBSERVE changes
  // see https://github.com/angular/angular/issues/11704
  getAll(): Observable<Application[]> {
    // first get the applications
    return this.getAllInternal()
      .mergeMap(applications => {
        if (applications.length === 0) {
          return Observable.of([] as Application[]);
        }

        // replace \\n (JSON format) with newlines in each application
        applications.forEach((application, i) => {
          if (applications[i].description) {
            applications[i].description = applications[i].description.replace(/\\n/g, '\n');
          }
          if (applications[i].legalDescription) {
            applications[i].legalDescription = applications[i].legalDescription.replace(/\\n/g, '\n');
          }
        });

        const promises: Array<Promise<any>> = [];

        // FUTURE: now get the organization for each application

        // now get the current comment period for each application
        applications.forEach((application, i) => {
          promises.push(this.commentPeriodService.getAllByApplicationId(applications[i]._id)
            .toPromise()
            .then(periods => {
              const cp = this.commentPeriodService.getCurrent(periods);
              applications[i].currentPeriod = cp;
              // derive comment period status for app list display
              applications[i]['cpStatus'] = this.commentPeriodService.getStatusString(this.commentPeriodService.getStatusCode(cp));
            })
          );
        });

        // now get the referenced data (features)
        applications.forEach((application, i) => {
          promises.push(this.featureService.getByApplicationId(application._id)
            .toPromise()
            .then(features => {
              application.features = features;

              // calculate Total Area (hectares) from all features
              application.areaHectares = 0;
              _.each(application.features, function (f) {
                if (f['properties']) {
                  application.areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
                }
              });

              // derive application status for app list display
              application['appStatus'] = this.getStatusString(application.status);
            })
          );
        });

        return Promise.all(promises).then(() => { return applications; });
      })
      .catch(this.api.handleError);
  }

  // get just the applications
  private getAllInternal(): Observable<Application[]> {
    return this.api.getApplications()
      .map(res => {
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
      .map(res => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .mergeMap(application => {
        if (!application) { return Observable.of(null as Application); }

        // replace \\n (JSON format) with newlines
        if (application.description) {
          application.description = application.description.replace(/\\n/g, '\n');
        }
        if (application.legalDescription) {
          application.legalDescription = application.legalDescription.replace(/\\n/g, '\n');
        }

        const promises: Array<Promise<any>> = [];

        // FUTURE: now get the organization

        // now get the documents
        promises.push(this.documentService.getAllByApplicationId(application._id)
          .toPromise()
          .then(documents => application.documents = documents)
        );

        // now get the current comment period
        promises.push(this.commentPeriodService.getAllByApplicationId(application._id)
          .toPromise()
          .then(periods => {
            const cp = this.commentPeriodService.getCurrent(periods);
            application.currentPeriod = cp;
            // derive comment period status for display
            application['cpStatus'] = this.commentPeriodService.getStatusString(this.commentPeriodService.getStatusCode(cp));
          })

        );

        // now get the decision
        promises.push(this.decisionService.getByApplicationId(application._id, forceReload)
          .toPromise()
          .then(decision => application.decision = decision)
        );

        // now get the shapes
        promises.push(this.featureService.getByDTID(application.tantalisID)
          .toPromise()
          .then(features => {
            application.features = features;

            // calculate Total Area (hectares) from all features
            application.areaHectares = 0;
            _.each(application.features, function (f) {
              if (f['properties']) {
                application.areaHectares += f['properties'].TENURE_AREA_IN_HECTARES;
              }
            });

            // derive application status for display
            application['appStatus'] = this.getStatusString(application.status);
          })
        );

        return Promise.all(promises).then(() => {
          this.application = application;
          return this.application;
        });
      })
      .catch(this.api.handleError);
  }

  /**
     * Given a status string, returns status abbreviation.
     * TODO: this should be done in the API (same as region)
     */
  getStatusCode(statusString: string): string {
    if (statusString) {
      switch (statusString.toUpperCase()) {
        case 'ABANDONED': return this.ABANDONED;
        case 'ACCEPTED': return this.ACCEPTED;
        case 'ALLOWED': return this.ALLOWED;
        case 'CANCELLED': return this.CANCELLED;
        case 'DISALLOWED': return this.DISALLOWED;
        case 'DISPOSITION IN GOOD STANDING': return this.DISPOSITION_GOOD_STANDING;
        case 'OFFER ACCEPTED': return this.OFFER_ACCEPTED;
        case 'OFFER NOT ACCEPTED': return this.OFFER_NOT_ACCEPTED;
        case 'OFFERED': return this.OFFERED;
        case 'SUSPENDED': return this.SUSPENDED;
      }
      // else return given status in title case
      return _.startCase(_.camelCase(statusString));
    }
    return this.UNKNOWN; // no data
  }

  /**
   * Given a status code, returns user-friendly status string.
   */
  getStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.ABANDONED: return this.applicationStatuses[this.ABANDONED];
        case this.ACCEPTED: return this.applicationStatuses[this.ACCEPTED];
        case this.ALLOWED: return this.applicationStatuses[this.ALLOWED];
        case this.CANCELLED: return this.applicationStatuses[this.CANCELLED];
        case this.DISALLOWED: return this.applicationStatuses[this.DISALLOWED];
        case this.DISPOSITION_GOOD_STANDING: return this.applicationStatuses[this.DISPOSITION_GOOD_STANDING];
        case this.OFFER_ACCEPTED: return this.applicationStatuses[this.OFFER_ACCEPTED];
        case this.OFFER_NOT_ACCEPTED: return this.applicationStatuses[this.OFFER_NOT_ACCEPTED];
        case this.OFFERED: return this.applicationStatuses[this.OFFERED];
        case this.SUSPENDED: return this.applicationStatuses[this.SUSPENDED];
        case this.DECISION_MADE: return this.applicationStatuses[this.DECISION_MADE];
        case this.UNKNOWN: return this.applicationStatuses[this.UNKNOWN];
      }
      return statusCode; // not one of the above, but return it anyway
    }
    return null;
  }

  isAccepted(statusCode: string): boolean {
    return (statusCode === this.ACCEPTED);
  }

  // NOTE: a decision may or may not include Cancelled
  // see code that uses this helper
  isDecision(statusCode: string): boolean {
    return (statusCode === this.ALLOWED
      || statusCode === this.CANCELLED
      || statusCode === this.DISALLOWED
      || statusCode === this.OFFER_ACCEPTED
      || statusCode === this.OFFER_NOT_ACCEPTED
      || statusCode === this.OFFERED
      || statusCode === this.DISPOSITION_GOOD_STANDING
    );
  }

  isCancelled(statusCode: string): boolean {
    return (statusCode === this.CANCELLED);
  }

  isAbandoned(statusCode: string): boolean {
    return (statusCode === this.ABANDONED);
  }

  isDispGoodStanding(statusCode: string): boolean {
    return (statusCode === this.DISPOSITION_GOOD_STANDING);
  }

  isSuspended(statusCode: string): boolean {
    return (statusCode === this.SUSPENDED);
  }

  /**
   * Given a region code, returns user-friendly region string.
   */
  getRegionString(regionCode: string): string {
    switch (regionCode) {
      case this.CARIBOO: return this.regions[this.CARIBOO];
      case this.KOOTENAY: return this.regions[this.KOOTENAY];
      case this.LOWER_MAINLAND: return this.regions[this.LOWER_MAINLAND];
      case this.OMENICA: return this.regions[this.OMENICA];
      case this.PEACE: return this.regions[this.PEACE];
      case this.SKEENA: return this.regions[this.SKEENA];
      case this.SOUTHERN_INTERIOR: return this.regions[this.SOUTHERN_INTERIOR];
      case this.VANCOUVER_ISLAND: return this.regions[this.VANCOUVER_ISLAND];
    }
    return null;
  }
}
