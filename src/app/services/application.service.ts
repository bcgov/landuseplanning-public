import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import * as moment from 'moment';

import { FiltersType } from 'app/applications/applist-filters/applist-filters.component';
import { Application } from 'app/models/application';
import { ApiService } from './api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';
import { FeatureService } from './feature.service';

@Injectable()
export class ApplicationService {

  //#region Constants
  // statuses / query param options
  readonly ABANDONED = 'AB';
  readonly ACCEPTED = 'AC';
  readonly ALLOWED = 'AL';
  readonly CANCELLED = 'CA';
  readonly DECISION_MADE = 'DE'; // special combination status (see isDecision below)
  readonly DISALLOWED = 'DI';
  readonly DISPOSITION_GOOD_STANDING = 'DG';
  readonly OFFER_ACCEPTED = 'OA';
  readonly OFFER_NOT_ACCEPTED = 'ON';
  readonly OFFERED = 'OF';
  readonly SUSPENDED = 'SU';
  readonly UNKNOWN = 'UN'; // special status when no data

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
    private featureService: FeatureService
  ) {
    // user-friendly strings for display
    this.applicationStatuses[this.ABANDONED] = 'Application Abandoned';
    this.applicationStatuses[this.ACCEPTED] = 'Application Under Review';
    this.applicationStatuses[this.ALLOWED] = 'Decision: Allowed';
    this.applicationStatuses[this.CANCELLED] = 'Application Cancelled';
    this.applicationStatuses[this.DECISION_MADE] = 'Decision Made';
    this.applicationStatuses[this.DISALLOWED] = 'Decision: Not Approved';
    this.applicationStatuses[this.DISPOSITION_GOOD_STANDING] = 'Tenure: Disposition in Good Standing';
    this.applicationStatuses[this.OFFER_ACCEPTED] = 'Decision: Offer Accepted';
    this.applicationStatuses[this.OFFER_NOT_ACCEPTED] = 'Decision: Offer Not Accepted';
    this.applicationStatuses[this.OFFERED] = 'Decision: Offered';
    this.applicationStatuses[this.SUSPENDED] = 'Tenure: Suspended';
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

  // get count of matching applications
  getCount(filters: FiltersType, coordinates: string): Observable<number> {
    // assign publish date filters
    const publishSince = filters.publishFrom ? filters.publishFrom.toISOString() : null;
    const publishUntil = filters.publishTo ? filters.publishTo.toISOString() : null;

    // handle comment period filtering
    const cpOpen = filters.cpStatuses.includes(this.commentPeriodService.OPEN);
    const cpNotOpen = filters.cpStatuses.includes(this.commentPeriodService.NOT_OPEN);

    // if both cpOpen and cpNotOpen or neither cpOpen nor cpNotOpen then use no cpStart or cpEnd filters
    if ((cpOpen && cpNotOpen) || (!cpOpen && !cpNotOpen)) {
      return this.api.getCountApplications(filters.regions, null, null, null, null, filters.appStatuses, filters.applicant,
        filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates)
        .catch(this.api.handleError);
    }

    const now = moment();
    // watch out -- Moment mutates objects!
    const yesterday = now.clone().subtract(1, 'days');
    const tomorrow = now.clone().add(1, 'days');

    // if cpOpen then filter by cpStart <= today && cpEnd >= today
    if (cpOpen) {
      return this.api.getCountApplications(filters.regions, null, now.endOf('day').toISOString(), now.startOf('day').toISOString(), null,
        filters.appStatuses, filters.applicant, filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates)
        .catch(this.api.handleError);
    }

    // else cpNotOpen (ie, closed or future) then filter by cpEnd <= yesterday || cpStart >= tomorrow
    // NB: this doesn't return apps without comment periods
    const closed = this.api.getCountApplications(filters.regions, null, null, null, yesterday.endOf('day').toISOString(),
      filters.appStatuses, filters.applicant, filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates);
    const future = this.api.getCountApplications(filters.regions, tomorrow.startOf('day').toISOString(), null, null, null,
      filters.appStatuses, filters.applicant, filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates);

    return Observable.combineLatest(closed, future, (v1, v2) => v1 + v2)
      .catch(this.api.handleError);
  }

  // get matching applications without their meta (documents, comment period, decisions, etc)
  getAll(pageNum: number = 0, pageSize: number = 1000, filters: FiltersType, coordinates: string): Observable<Application[]> {
    // assign publish date filters
    const publishSince = filters.publishFrom ? filters.publishFrom.toISOString() : null;
    const publishUntil = filters.publishTo ? filters.publishTo.toISOString() : null;

    // handle comment period filtering
    const cpOpen = filters.cpStatuses.includes(this.commentPeriodService.OPEN);
    const cpNotOpen = filters.cpStatuses.includes(this.commentPeriodService.NOT_OPEN);

    // if both cpOpen and cpNotOpen or neither cpOpen nor cpNotOpen then use no cpStart or cpEnd filters
    if ((cpOpen && cpNotOpen) || (!cpOpen && !cpNotOpen)) {
      return this.api.getApplications(pageNum, pageSize, filters.regions, null, null, null, null, filters.appStatuses, filters.applicant,
        filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates)
        .map(res => {
          const applications = res.text() ? res.json() : [];
          applications.forEach((application, i) => {
            applications[i] = new Application(application);
          });
          return applications as Application[];
        })
        .catch(this.api.handleError);
    }

    const now = moment();
    // watch out -- Moment mutates objects!
    const yesterday = now.clone().subtract(1, 'days');
    const tomorrow = now.clone().add(1, 'days');

    // if cpOpen then filter by cpStart <= today && cpEnd >= today
    if (cpOpen) {
      return this.api.getApplications(pageNum, pageSize, filters.regions, null, now.endOf('day').toISOString(), now.startOf('day').toISOString(),
        null, filters.appStatuses, filters.applicant, filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates)
        .map(res => {
          const applications = res.text() ? res.json() : [];
          applications.forEach((application, i) => {
            applications[i] = new Application(application);
          });
          return applications as Application[];
        })
        .catch(this.api.handleError);
    }

    // else cpNotOpen (ie, closed or future) then filter by cpEnd <= yesterday || cpStart >= tomorrow
    // NB: this doesn't return apps without comment periods
    const closed = this.api.getApplications(pageNum, pageSize, filters.regions, null, null, null, yesterday.endOf('day').toISOString(),
      filters.appStatuses, filters.applicant, filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates);
    const future = this.api.getApplications(pageNum, pageSize, filters.regions, tomorrow.startOf('day').toISOString(), null, null, null,
      filters.appStatuses, filters.applicant, filters.clidDtid, filters.purpose, filters.subpurpose, publishSince, publishUntil, coordinates);

    return Observable.merge(closed, future)
      .map(res => {
        const applications = res.text() ? res.json() : [];
        applications.forEach((application, i) => {
          applications[i] = new Application(application);
        });
        return applications as Application[];
      })
      .catch(this.api.handleError);
  }

  // get a specific application by its id
  getById(appId: string, forceReload: boolean = false): Observable<Application> {
    if (this.application && this.application._id === appId && !forceReload) {
      return Observable.of(this.application);
    }

    // first get the application
    return this.api.getApplication(appId)
      .map(res => {
        const applications = res.text() ? res.json() : [];
        // return the first (only) application
        return applications.length > 0 ? new Application(applications[0]) : null;
      })
      .mergeMap(application => {
        if (!application) { return Observable.of(null as Application); }

        const promises: Array<Promise<any>> = [];

        // derive region code
        application.region = this.getRegionCode(application.businessUnit);

        // user-friendly application status
        application.appStatus = this.getStatusString(this.getStatusCode(application.status));

        // 7-digit CL File number for display
        if (application.cl_file) {
          application['clFile'] = application.cl_file.toString().padStart(7, '0');
        }

        // get the documents
        promises.push(this.documentService.getAllByApplicationId(application._id)
          .toPromise()
          .then(documents => application.documents = documents)
        );

        // get the current comment period
        promises.push(this.commentPeriodService.getAllByApplicationId(application._id)
          .toPromise()
          .then(periods => {
            const cp = this.commentPeriodService.getCurrent(periods); // may be null
            application.currentPeriod = cp;
            // comment period status code
            application.cpStatusCode = this.commentPeriodService.getStatusCode(cp);
          })
        );

        // get the decision
        promises.push(this.decisionService.getByApplicationId(application._id, forceReload)
          .toPromise()
          .then(decision => application.decision = decision)
        );

        // get the features
        promises.push(this.featureService.getByApplicationId(application._id)
          .toPromise()
          .then(features => application.features = features)
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
        case this.DECISION_MADE: return this.applicationStatuses[this.DECISION_MADE];
        case this.DISALLOWED: return this.applicationStatuses[this.DISALLOWED];
        case this.DISPOSITION_GOOD_STANDING: return this.applicationStatuses[this.DISPOSITION_GOOD_STANDING];
        case this.OFFER_ACCEPTED: return this.applicationStatuses[this.OFFER_ACCEPTED];
        case this.OFFER_NOT_ACCEPTED: return this.applicationStatuses[this.OFFER_NOT_ACCEPTED];
        case this.OFFERED: return this.applicationStatuses[this.OFFERED];
        case this.SUSPENDED: return this.applicationStatuses[this.SUSPENDED];
        case this.UNKNOWN: return this.applicationStatuses[this.UNKNOWN];
      }
      return statusCode; // not one of the above, but return it anyway
    }
    return null;
  }

  isAbandoned(statusCode: string): boolean {
    return (statusCode === this.ABANDONED);
  }

  isAccepted(statusCode: string): boolean {
    return (statusCode === this.ACCEPTED);
  }

  isAllowed(statusCode: string): boolean {
    return (statusCode === this.ALLOWED);
  }

  isCancelled(statusCode: string): boolean {
    return (statusCode === this.CANCELLED);
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

  isDisallowed(statusCode: string): boolean {
    return (statusCode === this.DISALLOWED);
  }

  isDispGoodStanding(statusCode: string): boolean {
    return (statusCode === this.DISPOSITION_GOOD_STANDING);
  }

  isOfferAccepted(statusCode: string): boolean {
    return (statusCode === this.OFFER_ACCEPTED);
  }

  isOfferNotAccepted(statusCode: string): boolean {
    return (statusCode === this.OFFER_NOT_ACCEPTED);
  }

  isOffered(statusCode: string): boolean {
    return (statusCode === this.OFFERED);
  }

  isSuspended(statusCode: string): boolean {
    return (statusCode === this.SUSPENDED);
  }

  isUnknown(statusCode: string): boolean {
    return (statusCode === this.UNKNOWN);
  }

  /**
   * Returns region abbreviation.
   */
  getRegionCode(businessUnit: string): string {
    return businessUnit && businessUnit.toUpperCase().split(' ')[0];
  }

  /**
   * Given a region code, returns user-friendly region string.
   */
  getRegionString(abbrev: string): string {
    return abbrev && this.regions[abbrev]; // returns null if not found
  }

}
