import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable, of, combineLatest, merge, throwError } from 'rxjs';
import { map, mergeMap, toArray } from 'rxjs/operators';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';
import { Decision } from 'app/models/decision';
import { Document } from 'app/models/document';
import { Feature } from 'app/models/feature';
import { User } from 'app/models/user';

@Injectable()
export class ApiService {
  // public token: string;
  public isMS: boolean; // IE, Edge, etc
  public apiPath: string;
  public adminUrl: string;
  public env: 'local' | 'dev' | 'test' | 'demo' | 'scale' | 'beta' | 'master' | 'prod';

  constructor(
    private http: HttpClient
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
    }
  }

  handleError(error: any): Observable<never> {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    return throwError(error);
  }

  //
  // Applications
  //
  getCountApplications(params: object): Observable<number> {
    let queryString = `application?`;
    if (params['cpStartSince']) { queryString += `cpStart[since]=${params['cpStartSince']}&`; }
    if (params['cpStartUntil']) { queryString += `cpStart[until]=${params['cpStartUntil']}&`; }
    if (params['cpEndSince']) { queryString += `cpEnd[since]=${params['cpEndSince']}&`; }
    if (params['cpEndUntil']) { queryString += `cpEnd[until]=${params['cpEndUntil']}&`; }
    if (params['appStatuses']) { params['appStatuses'].forEach((status: string) => queryString += `status[eq]=${status}&`); }
    if (params['applicant']) { queryString += `client=${encodeURIComponent(params['applicant'])}&`; }
    if (params['purposes']) { params['purposes'].forEach((purpose: string) => queryString += `purpose[eq]=${encodeURIComponent(purpose)}&`); }
    if (params['subpurposes']) { params['subpurposes'].forEach((subpurpose: string) => queryString += `subpurpose[eq]=${encodeURIComponent(subpurpose)}&`); }
    if (params['publishSince']) { queryString += `publishDate[since]=${params['publishSince']}&`; }
    if (params['publishUntil']) { queryString += `publishDate[until]=${params['publishUntil']}&`; }
    if (params['coordinates']) { queryString += `centroid=${params['coordinates']}&`; }

    if (!params['clidDtid']) {
      // trim the last ? or &
      queryString = queryString.slice(0, -1);

      // retrieve the count from the response headers
      return this.http.head<HttpResponse<Object>>(`${this.apiPath}/${queryString}`, { observe: 'response' })
        .pipe(map(res => parseInt(res.headers.get('x-total-count'), 10)));
    } else {
      // query for both CLID and DTID
      const clid = this.http.head<HttpResponse<Object>>(`${this.apiPath}/${queryString}cl_file=${params['clidDtid']}`, { observe: 'response' })
        .pipe(map(res => parseInt(res.headers.get('x-total-count'), 10)));
      const dtid = this.http.head<HttpResponse<Object>>(`${this.apiPath}/${queryString}tantalisId=${params['clidDtid']}`, { observe: 'response' })
        .pipe(map(res => parseInt(res.headers.get('x-total-count'), 10)));

      // return sum of counts
      return combineLatest(clid, dtid, (v1, v2) => v1 + v2);
    }
  }

  getApplications(params: object): Observable<Application[]> {
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
      'statusHistoryEffectiveDate',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];

    let queryString = 'application?';
    if (params['pageNum']) { queryString += `pageNum=${params['pageNum']}&`; }
    if (params['pageSize']) { queryString += `pageSize=${params['pageSize']}&`; }
    if (params['cpStartSince']) { queryString += `cpStart[since]=${params['cpStartSince']}&`; }
    if (params['cpStartUntil']) { queryString += `cpStart[until]=${params['cpStartUntil']}&`; }
    if (params['cpEndSince']) { queryString += `cpEnd[since]=${params['cpEndSince']}&`; }
    if (params['cpEndUntil']) { queryString += `cpEnd[until]=${params['cpEndUntil']}&`; }
    if (params['appStatuses']) { params['appStatuses'].forEach((status: string) => queryString += `status[eq]=${status}&`); }
    if (params['applicant']) { queryString += `client=${encodeURIComponent(params['applicant'])}&`; }
    if (params['purposes']) { params['purposes'].forEach((purpose: string) => queryString += `purpose[eq]=${encodeURIComponent(purpose)}&`); }
    if (params['subpurposes']) { params['subpurposes'].forEach((subpurpose: string) => queryString += `subpurpose[eq]=${encodeURIComponent(subpurpose)}&`); }
    if (params['publishSince']) { queryString += `publishDate[since]=${params['publishSince']}&`; }
    if (params['publishUntil']) { queryString += `publishDate[until]=${params['publishUntil']}&`; }
    if (params['coordinates']) { queryString += `centroid=${params['coordinates']}&`; }
    queryString += `fields=${this.buildValues(fields)}`;

    if (!params['clidDtid']) {
      return this.http.get<Application[]>(`${this.apiPath}/${queryString}`);
    } else {
      // query for both CLID and DTID
      const clid = this.http.get<Application[]>(`${this.apiPath}/${queryString}&cl_file=${params['clidDtid']}`);
      const dtid = this.http.get<Application[]>(`${this.apiPath}/${queryString}&tantalisId=${params['clidDtid']}`);

      // return merged results, using toArray to wait for all results (ie, single emit)
      // this is fine performance-wise because there should be no more than a few results
      return merge(clid, dtid).pipe(toArray(), mergeMap(items => of(...items)));
    }
  }

  getApplication(id: string): Observable<Application[]> {
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
      'statusHistoryEffectiveDate',
      'subpurpose',
      'subtype',
      'tantalisID',
      'tenureStage',
      'type'
    ];
    const queryString = 'application/' + id + '?fields=' + this.buildValues(fields);
    return this.http.get<Application[]>(`${this.apiPath}/${queryString}`);
  }

  //
  // Features
  //
  getFeaturesByTantalisId(tantalisID: number): Observable<Feature[]> {
    const fields = [
      'applicationID',
      'geometry',
      'geometryName',
      'properties',
      'type'
    ];
    const queryString = `feature?tantalisId=${tantalisID}&fields=${this.buildValues(fields)}`;
    return this.http.get<Feature[]>(`${this.apiPath}/${queryString}`);
  }

  getFeaturesByApplicationId(applicationId: string): Observable<Feature[]> {
    const fields = [
      'applicationID',
      'geometry',
      'geometryName',
      'properties',
      'type'
    ];
    const queryString = `feature?applicationId=${applicationId}&fields=${this.buildValues(fields)}`;
    return this.http.get<Feature[]>(`${this.apiPath}/${queryString}`);
  }

  //
  // Decisions
  //
  getDecisionByAppId(appId: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_application',
      'name',
      'description'
    ];
    const queryString = 'decision?_application=' + appId + '&fields=' + this.buildValues(fields);
    return this.http.get<Decision[]>(`${this.apiPath}/${queryString}`);
  }

  getDecision(id: string): Observable<Decision[]> {
    const fields = [
      '_addedBy',
      '_application',
      'name',
      'description'
    ];
    const queryString = 'decision/' + id + '?fields=' + this.buildValues(fields);
    return this.http.get<Decision[]>(`${this.apiPath}/${queryString}`);
  }

  //
  // Comment Periods
  //
  getPeriodsByAppId(appId: string): Observable<CommentPeriod[]> {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate'
    ];
    const queryString = 'commentperiod?_application=' + appId + '&fields=' + this.buildValues(fields);
    return this.http.get<CommentPeriod[]>(`${this.apiPath}/${queryString}`);
  }

  getPeriod(id: string): Observable<CommentPeriod[]> {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate'
    ];
    const queryString = 'commentperiod/' + id + '?fields=' + this.buildValues(fields);
    return this.http.get<CommentPeriod[]>(`${this.apiPath}/${queryString}`);
  }

  //
  // Comments
  //
  getCommentsByPeriodId(periodId: string): Observable<Comment[]> {
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
    return this.http.get<Comment[]>(`${this.apiPath}/${queryString}`);
  }

  getComment(id: string): Observable<Comment[]> {
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
    return this.http.get<Comment[]>(`${this.apiPath}/${queryString}`);
  }

  addComment(comment: Comment): Observable<Comment> {
    const fields = [
      'comment',
      'commentAuthor'
    ];
    const queryString = 'comment?fields=' + this.buildValues(fields);
    return this.http.post<Comment>(`${this.apiPath}/${queryString}`, comment, {});
  }

  //
  // Documents
  //
  getDocumentsByAppId(appId: string): Observable<Document[]> {
    const fields = [
      '_application',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document?_application=' + appId + '&fields=' + this.buildValues(fields);
    return this.http.get<Document[]>(`${this.apiPath}/${queryString}`);
  }

  getDocumentsByCommentId(commentId: string): Observable<Document[]> {
    const fields = [
      '_comment',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document?_comment=' + commentId + '&fields=' + this.buildValues(fields);
    return this.http.get<Document[]>(`${this.apiPath}/${queryString}`);
  }

  getDocumentsByDecisionId(decisionId: string): Observable<Document[]> {
    const fields = [
      '_decision',
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document?_decision=' + decisionId + '&fields=' + this.buildValues(fields);
    return this.http.get<Document[]>(`${this.apiPath}/${queryString}`);
  }

  getDocument(id: string): Observable<Document[]> {
    const queryString = 'document/' + id;
    return this.http.get<Document[]>(`${this.apiPath}/${queryString}`);
  }

  uploadDocument(formData: FormData): Observable<Document> {
    const fields = [
      'documentFileName',
      'displayName',
      'internalURL',
      'internalMime'
    ];
    const queryString = 'document/?fields=' + this.buildValues(fields);
    return this.http.post<Document>(`${this.apiPath}/${queryString}`, formData, { reportProgress: true });
  }

  getDocumentUrl(document: Document): string {
    return document ? (this.apiPath + '/document/' + document._id + '/download') : '';
  }

  //
  // Users
  //
  getAllUsers(): Observable<User[]> {
    const fields = [
      'displayName',
      'username',
      'firstName',
      'lastName'
    ];
    const queryString = 'user?fields=' + this.buildValues(fields);
    return this.http.get<User[]>(`${this.apiPath}/${queryString}`);
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
}
