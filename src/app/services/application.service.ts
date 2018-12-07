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

import { FiltersType } from 'app/applications/applications.component';
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
  readonly APPLICATION_UNDER_REVIEW = 'AUR';
  readonly APPLICATION_REVIEW_COMPLETE = 'ARC';
  readonly DECISION_APPROVED = 'DA';
  readonly DECISION_NOT_APPROVED = 'DNA';
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

  private application: Application = null; // for caching

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService,
    private featureService: FeatureService
  ) { }

  // get count of matching applications
  getCount(filters: FiltersType, coordinates: string): Observable<number> {
    // assign publish date filters
    const publishSince = filters.publishFrom ? filters.publishFrom.toISOString() : null;
    const publishUntil = filters.publishTo ? filters.publishTo.toISOString() : null;

    // convert application statuses from codes to strings
    const appStatuses = _.flatMap(filters.appStatuses, statusCode => this.getTantalisStatus(statusCode));

    // handle comment period filtering
    const cpOpen = filters.cpStatuses.includes(this.commentPeriodService.OPEN);
    const cpNotOpen = filters.cpStatuses.includes(this.commentPeriodService.NOT_OPEN);

    // if both cpOpen and cpNotOpen or neither cpOpen nor cpNotOpen then use no cpStart or cpEnd filters
    if ((cpOpen && cpNotOpen) || (!cpOpen && !cpNotOpen)) {
      return this.api.getCountApplications({
        appStatuses: appStatuses,
        applicant: filters.applicant,
        clidDtid: filters.clidDtid,
        purposes: filters.purposes,
        subpurposes: filters.subpurposes,
        publishSince: publishSince,
        publishUntil: publishUntil,
        coordinates: coordinates
      })
        .catch(this.api.handleError);
    }

    const now = moment();
    // watch out -- Moment mutates objects!
    const yesterday = now.clone().subtract(1, 'days');
    const tomorrow = now.clone().add(1, 'days');

    // if cpOpen then filter by cpStart <= today && cpEnd >= today
    if (cpOpen) {
      return this.api.getCountApplications({
        cpStartUntil: now.endOf('day').toISOString(),
        cpEndSince: now.startOf('day').toISOString(),
        appStatuses: appStatuses,
        applicant: filters.applicant,
        clidDtid: filters.clidDtid,
        purposes: filters.purposes,
        subpurposes: filters.subpurposes,
        publishSince: publishSince,
        publishUntil: publishUntil,
        coordinates: coordinates
      })
        .catch(this.api.handleError);
    }

    // else cpNotOpen (ie, closed or future) then filter by cpEnd <= yesterday || cpStart >= tomorrow
    // NB: this doesn't return apps without comment periods
    const closed = this.api.getCountApplications({
      cpEndUntil: yesterday.endOf('day').toISOString(),
      appStatuses: appStatuses,
      applicant: filters.applicant,
      clidDtid: filters.clidDtid,
      purposes: filters.purposes,
      subpurposes: filters.subpurposes,
      publishSince: publishSince,
      publishUntil: publishUntil,
      coordinates: coordinates
    });
    const future = this.api.getCountApplications({
      cpStartSince: tomorrow.startOf('day').toISOString(),
      appStatuses: appStatuses,
      applicant: filters.applicant,
      clidDtid: filters.clidDtid,
      purposes: filters.purposes,
      subpurposes: filters.subpurposes,
      publishSince: publishSince,
      publishUntil: publishUntil,
      coordinates: coordinates
    });

    return Observable.combineLatest(closed, future, (v1, v2) => v1 + v2)
      .catch(this.api.handleError);
  }

  // get matching applications without their meta (documents, comment period, decisions, etc)
  getAll(pageNum: number = 0, pageSize: number = 1000, filters: FiltersType, coordinates: string): Observable<Application[]> {
    // assign publish date filters
    const publishSince = filters.publishFrom ? filters.publishFrom.toISOString() : null;
    const publishUntil = filters.publishTo ? filters.publishTo.toISOString() : null;

    // convert application statuses from codes to strings
    const appStatuses = _.flatMap(filters.appStatuses, statusCode => this.getTantalisStatus(statusCode));

    // handle comment period filtering
    const cpOpen = filters.cpStatuses.includes(this.commentPeriodService.OPEN);
    const cpNotOpen = filters.cpStatuses.includes(this.commentPeriodService.NOT_OPEN);

    // if both cpOpen and cpNotOpen or neither cpOpen nor cpNotOpen then use no cpStart or cpEnd filters
    if ((cpOpen && cpNotOpen) || (!cpOpen && !cpNotOpen)) {
      return this.api.getApplications({
        pageNum: pageNum,
        pageSize: pageSize,
        appStatuses: appStatuses,
        applicant: filters.applicant,
        clidDtid: filters.clidDtid,
        purposes: filters.purposes,
        subpurposes: filters.subpurposes,
        publishSince: publishSince,
        publishUntil: publishUntil,
        coordinates: coordinates
      })
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
      return this.api.getApplications({
        pageNum: pageNum,
        pageSize: pageSize,
        cpStartUntil: now.endOf('day').toISOString(),
        cpEndSince: now.startOf('day').toISOString(),
        appStatuses: appStatuses,
        applicant: filters.applicant,
        clidDtid: filters.clidDtid,
        purposes: filters.purposes,
        subpurposes: filters.subpurposes,
        publishSince: publishSince,
        publishUntil: publishUntil,
        coordinates: coordinates
      })
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
    const closed = this.api.getApplications({
      pageNum: pageNum,
      pageSize: pageSize,
      cpEndUntil: yesterday.endOf('day').toISOString(),
      appStatuses: appStatuses,
      applicant: filters.applicant,
      clidDtid: filters.clidDtid,
      purposes: filters.purposes,
      subpurposes: filters.subpurposes,
      publishSince: publishSince,
      publishUntil: publishUntil,
      coordinates: coordinates
    });
    const future = this.api.getApplications({
      pageNum: pageNum,
      pageSize: pageSize,
      cpStartSince: tomorrow.startOf('day').toISOString(),
      appStatuses: appStatuses,
      applicant: filters.applicant,
      clidDtid: filters.clidDtid,
      purposes: filters.purposes,
      subpurposes: filters.subpurposes,
      publishSince: publishSince,
      publishUntil: publishUntil,
      coordinates: coordinates
    });

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
        application.appStatus = this.getLongStatusString(this.getStatusCode(application.status));

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
   * Map Tantalis Status to status code.
   */
  getStatusCode(statusString: string): string {
    if (statusString) {
      switch (statusString.toUpperCase()) {
        case 'ABANDONED':
        case 'CANCELLED':
        case 'OFFER NOT ACCEPTED':
        case 'OFFER RESCINDED':
        case 'RETURNED':
        case 'REVERTED':
        case 'SOLD':
        case 'SUSPENDED':
        case 'WITHDRAWN':
          return this.ABANDONED;

        case 'ACCEPTED':
        case 'ALLOWED':
        case 'PENDING':
        case 'RECEIVED':
          return this.APPLICATION_UNDER_REVIEW;

        case 'OFFER ACCEPTED':
        case 'OFFERED':
          return this.APPLICATION_REVIEW_COMPLETE;

        case 'ACTIVE':
        case 'COMPLETED':
        case 'DISPOSITION IN GOOD STANDING':
        case 'EXPIRED':
        case 'HISTORIC':
          return this.DECISION_APPROVED;

        case 'DISALLOWED':
          return this.DECISION_NOT_APPROVED;

        case 'NOT USED':
        case 'PRE-TANTALIS':
          return this.UNKNOWN;
      }
    }
    return this.UNKNOWN;
  }

  /**
   * Map status code to Tantalis Status(es).
   */
  getTantalisStatus(statusCode: string): Array<string> {
    if (statusCode) {
      switch (statusCode.toUpperCase()) {
        case this.ABANDONED: return ['ABANDONED', 'CANCELLED', 'OFFER NOT ACCEPTED', 'OFFER RESCINDED', 'RETURNED', 'REVERTED', 'SOLD', 'SUSPENDED', 'WITHDRAWN'];
        case this.APPLICATION_UNDER_REVIEW: return ['ACCEPTED', 'ALLOWED', 'PENDING', 'RECEIVED'];
        case this.APPLICATION_REVIEW_COMPLETE: return ['OFFER ACCEPTED', 'OFFERED'];
        case this.DECISION_APPROVED: return ['ACTIVE', 'COMPLETED', 'DISPOSITION IN GOOD STANDING', 'EXPIRED', 'HISTORIC'];
        case this.DECISION_NOT_APPROVED: return ['DISALLOWED'];
      }
    }
    return null;
  }

  /**
   * Given a status code, returns a short user-friendly status string.
   */
  getShortStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.ABANDONED: return 'Abandoned';
        case this.APPLICATION_UNDER_REVIEW: return 'Under Review';
        case this.APPLICATION_REVIEW_COMPLETE: return 'Decision Pending';
        case this.DECISION_APPROVED: return 'Approved';
        case this.DECISION_NOT_APPROVED: return 'Not Approved';
        case this.UNKNOWN: return 'Unknown';
      }
    }
    return null;
  }

  /**
   * Given a status code, returns a long user-friendly status string.
   */
  getLongStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.ABANDONED: return 'Abandoned';
        case this.APPLICATION_UNDER_REVIEW: return 'Application Under Review';
        case this.APPLICATION_REVIEW_COMPLETE: return 'Application Review Complete - Decision Pending';
        case this.DECISION_APPROVED: return 'Decision: Approved - Tenure Issued';
        case this.DECISION_NOT_APPROVED: return 'Decision: Not Approved';
        case this.UNKNOWN: return 'Unknown Status';
      }
    }
    return null;
  }

  isAbandoned(statusCode: string): boolean {
    return (statusCode === this.ABANDONED);
  }

  isApplicationUnderReview(statusCode: string): boolean {
    return (statusCode === this.APPLICATION_UNDER_REVIEW);
  }

  isApplicationReviewComplete(statusCode: string): boolean {
    return (statusCode === this.APPLICATION_REVIEW_COMPLETE);
  }

  isDecisionApproved(statusCode: string): boolean {
    return (statusCode === this.DECISION_APPROVED);
  }

  isDecisionNotApproved(statusCode: string): boolean {
    return (statusCode === this.DECISION_NOT_APPROVED);
  }

  isUnknown(statusCode: string): boolean {
    return (statusCode === this.UNKNOWN);
  }

  /**
   * Returns region code.
   */
  getRegionCode(businessUnit: string): string {
    return businessUnit && businessUnit.toUpperCase().split(' ')[0];
  }

  /**
   * Given a region code, returns a user-friendly region string.
   */
  getRegionString(abbrev: string): string {
    if (abbrev) {
      switch (abbrev) {
        case this.CARIBOO: return 'Cariboo, Williams Lake';
        case this.KOOTENAY: return 'Kootenay, Cranbrook';
        case this.LOWER_MAINLAND: return 'Lower Mainland, Surrey';
        case this.OMENICA: return 'Omenica/Peace, Prince George';
        case this.PEACE: return 'Peace, Ft. St. John';
        case this.SKEENA: return 'Skeena, Smithers';
        case this.SOUTHERN_INTERIOR: return 'Thompson Okanagan, Kamloops';
        case this.VANCOUVER_ISLAND: return 'West Coast, Nanaimo';
      }
    }
    return null;
  }

}
