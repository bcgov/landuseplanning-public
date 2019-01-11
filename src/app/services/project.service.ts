import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { Project } from 'app/models/project';
import { ApiService } from './api';
import { DocumentService } from './document.service';
import { CommentPeriodService } from './commentperiod.service';
import { DecisionService } from './decision.service';
import { FeatureService } from './feature.service';

@Injectable()
export class ProjectService {
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
  private projectStatuses: Array<string> = [];
  private regions: Array<string> = [];

  private project: Project = null; // for caching

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
    private commentPeriodService: CommentPeriodService,
    private decisionService: DecisionService,
    private featureService: FeatureService
  ) {
    // user-friendly strings for display
    this.projectStatuses[this.ABANDONED] = 'Project Abandoned';
    this.projectStatuses[this.ACCEPTED] = 'Project Under Review';
    this.projectStatuses[this.ALLOWED] = 'Decision: Allowed';
    this.projectStatuses[this.CANCELLED] = 'Project Cancelled';
    this.projectStatuses[this.DECISION_MADE] = 'Decision Made';
    this.projectStatuses[this.DISALLOWED] = 'Decision: Not Approved';
    this.projectStatuses[this.DISPOSITION_GOOD_STANDING] = 'Tenure: Disposition in Good Standing';
    this.projectStatuses[this.OFFER_ACCEPTED] = 'Decision: Offer Accepted';
    this.projectStatuses[this.OFFER_NOT_ACCEPTED] = 'Decision: Offer Not Accepted';
    this.projectStatuses[this.OFFERED] = 'Decision: Offered';
    this.projectStatuses[this.SUSPENDED] = 'Tenure: Suspended';
    this.projectStatuses[this.UNKNOWN] = 'Unknown Project Status';

    this.regions[this.CARIBOO] = 'Cariboo, Williams Lake';
    this.regions[this.KOOTENAY] = 'Kootenay, Cranbrook';
    this.regions[this.LOWER_MAINLAND] = 'Lower Mainland, Surrey';
    this.regions[this.OMENICA] = 'Omenica/Peace, Prince George';
    this.regions[this.PEACE] = 'Peace, Ft. St. John';
    this.regions[this.SKEENA] = 'Skeena, Smithers';
    this.regions[this.SOUTHERN_INTERIOR] = 'Thompson Okanagan, Kamloops';
    this.regions[this.VANCOUVER_ISLAND] = 'West Coast, Nanaimo';
  }

  // get just the projects (for fast mapping)
  getAll(pageNum: number = 0, pageSize: number = 1000000, regionFilters: object = {}, cpStatusFilters: object = {}, appStatusFilters: object = {},
    applicantFilter: string = null, clFileFilter: string = null, dispIdFilter: string = null, purposeFilter: string = null): Observable<Project[]> {
    const regions: Array<string> = [];
    const cpStatuses: Array<string> = [];
    const appStatuses: Array<string> = [];

    // convert array-like objects to arrays
    Object.keys(regionFilters).forEach(key => { if (regionFilters[key]) { regions.push(key); } });
    Object.keys(cpStatusFilters).forEach(key => { if (cpStatusFilters[key]) { cpStatuses.push(key); } });
    Object.keys(appStatusFilters).forEach(key => { if (appStatusFilters[key]) { appStatuses.push(key); } });

    return this.api.getProjects(pageNum, pageSize, regions, cpStatuses, appStatuses, applicantFilter, clFileFilter, dispIdFilter, purposeFilter)
      .map(res => {
        const projects = res.text() ? res.json() : [];
        projects.forEach((project, i) => {
          projects[i] = new Project(project);
          // FUTURE: derive region code, etc ?
        });
        return projects;
      })
      .catch(this.api.handleError);
  }

  // get count of projects
  getCount(): Observable<number> {
    return this.api.getCountProjects()
      .map(res => {
        // retrieve the count from the response headers
        return parseInt(res.headers.get('x-total-count'), 10);
      })
      .catch(this.api.handleError);
  }

  // get all projects and related data
  // TODO: instead of using promises to get all data at once, use observables and DEEP-OBSERVE changes
  // see https://github.com/angular/angular/issues/11704
  getAllFull(pageNum: number = 0, pageSize: number = 1000000, regionFilters: object = {}, cpStatusFilters: object = {}, appStatusFilters: object = {},
    applicantFilter: string = null, clFileFilter: string = null, dispIdFilter: string = null, purposeFilter: string = null): Observable<Project[]> {
    // first get the projects
    return this.getAll(pageNum, pageSize, regionFilters, cpStatusFilters, appStatusFilters, applicantFilter, clFileFilter, dispIdFilter, purposeFilter)
      .mergeMap(projects => {
        if (projects.length === 0) {
          return Observable.of([] as Project[]);
        }

        const promises: Array<Promise<any>> = [];

        projects.forEach((project) => {
          // derive region code
          // project.region = this.getRegionCode(project.businessUnit);

          // // user-friendly project status
          // project.appStatus = this.getStatusString(this.getStatusCode(project.status));

          // // 7-digit CL File number for display
          // if (project.cl_file) {
          //   project['clFile'] = project.cl_file.toString().padStart(7, '0');
          // }

          // NB: we don't get the documents here

          // get the current comment period
          // promises.push(this.commentPeriodService.getAllByProjectId(project._id)
          //   .toPromise()
          //   .then(periods => {
          //     const cp = this.commentPeriodService.getCurrent(periods);
          //     project.currentPeriod = cp;
          //     // user-friendly comment period status
          //     project.cpStatus = this.commentPeriodService.getStatusString(this.commentPeriodService.getStatusCode(cp));
          //   })
          // );

          // NB: we don't get the decision here

          // NB: we don't get the features here

        });

        return Promise.all(promises).then(() => { return projects; });
      })
      .catch(this.api.handleError);
  }

  // get a specific project by its id
  getById(appId: string, forceReload: boolean = false): Observable<Project> {
    if (this.project && this.project._id === appId && !forceReload) {
      return Observable.of(this.project);
    }

    // first get the project
    return this.api.getProject(appId)
      .map(res => {
        const projects = res.text() ? res.json() : [];
        // return the first (only) project
        return projects.length > 0 ? new Project(projects[0]) : null;
      })
      .mergeMap(project => {
        if (!project) { return Observable.of(null as Project); }

        const promises: Array<Promise<any>> = [];

        // derive region code
        // project.region = this.getRegionCode(project.businessUnit);

        // // user-friendly project status
        // project.appStatus = this.getStatusString(this.getStatusCode(project.status));

        // // 7-digit CL File number for display
        // if (project.cl_file) {
        //   project['clFile'] = project.cl_file.toString().padStart(7, '0');
        // }

        // get the documents
        // promises.push(this.documentService.getAllByProjectId(project._id)
        //   .toPromise()
        //   .then(documents => project.documents = documents)
        // );

        // // get the current comment period
        // promises.push(this.commentPeriodService.getAllByProjectId(project._id)
        //   .toPromise()
        //   .then(periods => {
        //     const cp = this.commentPeriodService.getCurrent(periods);
        //     project.currentPeriod = cp;
        //     // user-friendly comment period status
        //     project.cpStatus = this.commentPeriodService.getStatusString(this.commentPeriodService.getStatusCode(cp));
        //   })
        // );

        // // get the decision
        // promises.push(this.decisionService.getByProjectId(project._id, forceReload)
        //   .toPromise()
        //   .then(decision => project.decision = decision)
        // );

        // // get the features
        // promises.push(this.featureService.getByProjectId(project._id)
        //   .toPromise()
        //   .then(features => project.features = features)
        // );

        return Promise.all(promises).then(() => {
          this.project = project;
          return this.project;
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
        case this.ABANDONED: return this.projectStatuses[this.ABANDONED];
        case this.ACCEPTED: return this.projectStatuses[this.ACCEPTED];
        case this.ALLOWED: return this.projectStatuses[this.ALLOWED];
        case this.CANCELLED: return this.projectStatuses[this.CANCELLED];
        case this.DECISION_MADE: return this.projectStatuses[this.DECISION_MADE];
        case this.DISALLOWED: return this.projectStatuses[this.DISALLOWED];
        case this.DISPOSITION_GOOD_STANDING: return this.projectStatuses[this.DISPOSITION_GOOD_STANDING];
        case this.OFFER_ACCEPTED: return this.projectStatuses[this.OFFER_ACCEPTED];
        case this.OFFER_NOT_ACCEPTED: return this.projectStatuses[this.OFFER_NOT_ACCEPTED];
        case this.OFFERED: return this.projectStatuses[this.OFFERED];
        case this.SUSPENDED: return this.projectStatuses[this.SUSPENDED];
        case this.UNKNOWN: return this.projectStatuses[this.UNKNOWN];
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
