import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import 'rxjs/add/observable/throw';
import * as _ from 'lodash';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';

@Injectable()
export class ApiService {
  // public token: string;
  public isMS: boolean; // IE, Edge, etc
  public apiPath: string;
  public adminUrl: string;
  public env: 'local' | 'dev' | 'test' | 'demo' | 'scale' | 'beta' | 'master' | 'prod';

  constructor(
    private http: Http
  ) {
    // const currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
    // this.token = currentUser && currentUser.token;
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;
    const { hostname } = window.location;
    switch (hostname) {
      case 'localhost':
        // Local
        this.apiPath = 'http://localhost:3000/api/public';
        this.adminUrl = 'http://localhost:4200';
        this.env = 'local';
        break;

      case 'nrts-prc-dev.pathfinder.gov.bc.ca':
        // Dev
        this.apiPath = 'https://nrts-prc-dev.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-dev.pathfinder.gov.bc.ca/admin/';
        this.env = 'dev';
        break;

      case 'nrts-prc-test.pathfinder.gov.bc.ca':
        // Test
        this.apiPath = 'https://nrts-prc-test.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-test.pathfinder.gov.bc.ca/admin/';
        this.env = 'test';
        break;

      case 'nrts-prc-demo.pathfinder.gov.bc.ca':
        // Demo
        this.apiPath = 'https://nrts-prc-demo.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-demo.pathfinder.gov.bc.ca/admin/';
        this.env = 'demo';
        break;

      case 'nrts-prc-scale.pathfinder.gov.bc.ca':
        // Scale
        this.apiPath = 'https://nrts-prc-scale.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-scale.pathfinder.gov.bc.ca/admin/';
        this.env = 'scale';
        break;

      case 'nrts-prc-beta.pathfinder.gov.bc.ca':
        // Beta
        this.apiPath = 'https://nrts-prc-beta.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-beta.pathfinder.gov.bc.ca/admin/';
        this.env = 'beta';
        break;

      case 'nrts-prc-master.pathfinder.gov.bc.ca':
        // Master
        this.apiPath = 'https://nrts-prc-master.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-master.pathfinder.gov.bc.ca/admin/';
        this.env = 'master';
        break;

      default:
        // Prod
        this.apiPath = 'https://comment.nrs.gov.bc.ca/api/public';
        this.adminUrl = 'https://comment.nrs.gov.bc.ca/admin/';
        this.env = 'prod';
    };
  }

  handleError(error: any): ErrorObservable {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    return Observable.throw(error);
  }

  //
  // Applications
  //
  getCountApplications() {
    const queryString = `application`;
    return this.http.head(`${this.apiPath}/${queryString}`);
  }

  getApplications(pageNum: number, pageSize: number, regions: string[], cpStatuses: string[], appStatuses: string[], applicant: string,
    clFile: string, dispId: string, purpose: string) {
    const fields = [
      'agency',
      'areaHectares',
      'businessUnit',
      'centroid',
      'cl_file',
      'client',
      'description',
      'legalDescription',
      'location',
      'name',
      'publishDate',
      'purpose',
      'status',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];

    let queryString = 'application?';
    if (pageNum !== null) { queryString += `pageNum=${pageNum}&`; }
    if (pageSize !== null) { queryString += `pageSize=${pageSize}&`; }
    if (regions !== null && regions.length > 0) { queryString += `regions=${this.buildValues(regions)}&`; }
    if (cpStatuses !== null && cpStatuses.length > 0) { queryString += `cpStatuses=${this.buildValues(cpStatuses)}&`; }
    if (appStatuses !== null && appStatuses.length > 0) { queryString += `statuses=${this.buildValues(appStatuses)}&`; }
    if (applicant !== null) { queryString += `client=${applicant}&`; }
    if (clFile !== null) { queryString += `cl_file=${clFile}&`; }
    if (dispId !== null) { queryString += `tantalisId=${dispId}&`; }
    if (purpose !== null) { queryString += `purpose=${purpose}&`; }
    queryString += `fields=${this.buildValues(fields)}`;

    return this.get(queryString);
  }

  getApplication(id: string) {
    const fields = [
      'agency',
      'areaHectares',
      'businessUnit',
      'centroid',
      'cl_file',
      'client',
      'description',
      'legalDescription',
      'location',
      'name',
      'publishDate',
      'purpose',
      'status',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];
    const queryString = 'application/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  //
  // Features
  //
  getFeaturesByTantalisId(tantalisID: number) {
    const fields = [
      'applicationID',
      'geometry',
      'geometryName',
      'properties',
      'type'
    ];
    const queryString = `feature?tantalisId=${tantalisID}&fields=${this.buildValues(fields)}`;
    return this.get(queryString);
  }

  getFeaturesByApplicationId(applicationId: string) {
    const fields = [
      'applicationID',
      'geometry',
      'geometryName',
      'properties',
      'type'
    ];
    const queryString = `feature?applicationId=${applicationId}&fields=${this.buildValues(fields)}`;
    return this.get(queryString);
  }
  //
  // Organizations
  //
  getOrganizations() {
    const fields = [
      '_addedBy',
      'name'
    ];
    const queryString = 'organization?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getOrganization(id: string) {
    const fields = [
      '_addedBy',
      'name'
    ];
    const queryString = 'organization/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  //
  // Decisions
  //
  getDecisionByAppId(appId: string) {
    const fields = [
      '_addedBy',
      '_application',
      'name',
      'description'
    ];
    const queryString = 'decision?_application=' + appId + '&fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getDecision(id: string) {
    const fields = [
      '_addedBy',
      '_application',
      'name',
      'description'
    ];
    const queryString = 'decision/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  //
  // Comment Periods
  //
  getPeriodsByAppId(appId: string) {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate'
    ];
    const queryString = 'commentperiod?_application=' + appId + '&fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getPeriod(id: string) {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate'
    ];
    const queryString = 'commentperiod/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  //
  // Comments
  //
  getCommentsByPeriodId(periodId: string) {
    const fields = [
      '_addedBy',
      '_commentPeriod',
      'commentNumber',
      'comment',
      'commentAuthor',
      'review',
      'dateAdded',
      'commentStatus'
    ];
    const queryString = 'comment?_commentPeriod=' + periodId + '&fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getComment(id: string) {
    const fields = [
      '_addedBy',
      '_commentPeriod',
      'commentNumber',
      'comment',
      'commentAuthor',
      'review',
      'dateAdded',
      'commentStatus'
    ];
    const queryString = 'comment/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  addComment(comment: Comment) {
    const fields = [
      'comment',
      'commentAuthor'
    ];
    const queryString = 'comment?fields=' + this.buildValues(fields);
    return this.post(queryString, comment);
  }

  //
  // Documents
  //
  getDocumentsByAppId(appId: string) {
    const fields = [
      '_application',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document?_application=' + appId + '&fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getDocumentsByCommentId(commentId: string) {
    const fields = [
      '_comment',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document?_comment=' + commentId + '&fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getDocumentsByDecisionId(decisionId: string) {
    const fields = [
      '_decision',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document?_decision=' + decisionId + '&fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getDocument(id: string) {
    const queryString = 'document/' + id;
    return this.get(queryString);
  }

  uploadDocument(formData: FormData) {
    const fields = [
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document/?fields=' + this.buildValues(fields);
    return this.post(queryString, formData, { reportProgress: true });
  }

  getDocumentUrl(document: Document): string {
    return document ? (this.apiPath + '/document/' + document._id + '/download') : '';
  }

  //
  // Crown Lands files
  //
  getBCGWCrownLands(id: string) {
    const fields = [
      'name',
      'isImported'
    ];
    const queryString = 'search/bcgw/crownLandsId/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getBCGWDispositionTransactionId(id: number) {
    const fields = [
      'name'
    ];
    const queryString = 'search/bcgw/dispositionTransactionId/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  getClientsInfoByDispositionId(id: number) {
    const fields = [
      'name'
    ];
    const queryString = 'search/bcgw/getClientsInfoByDispositionId/' + id + '?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  //
  // Users
  //
  getAllUsers() {
    const fields = [
      'displayName',
      'username',
      'firstName',
      'lastName'
    ];
    const queryString = 'user?fields=' + this.buildValues(fields);
    return this.get(queryString);
  }

  //
  // Local helpers
  //
  private buildValues(collection: any[]): string {
    let values = '';
    _.each(collection, function (a) {
      values += a + '|';
    });
    // trim the last |
    return values.replace(/\|$/, '');
  }

  private get(apiRoute: string, options?: object) {
    return this.http.get(`${this.apiPath}/${apiRoute}`, options || null);
  }

  private put(apiRoute: string, body?: object, options?: object) {
    return this.http.put(`${this.apiPath}/${apiRoute}`, body || null, options || null);
  }

  private post(apiRoute: string, body?: object, options?: object) {
    return this.http.post(`${this.apiPath}/${apiRoute}`, body || null, options || null);
  }
  private delete(apiRoute: string, body?: object, options?: object) {
    return this.http.delete(`${this.apiPath}/${apiRoute}`, options || null);
  }
}
