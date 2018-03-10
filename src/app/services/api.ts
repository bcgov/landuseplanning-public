import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';

@Injectable()
export class ApiService {
  // public token: string;
  public apiPath: string;
  public adminUrl: string;
  public env: 'local' | 'dev' | 'test' | 'prod';

  constructor(private http: Http) {
    const { hostname } = window.location;
    // const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // this.token = currentUser && currentUser.token;
    switch (hostname) {
      case 'localhost':
        // Local
        this.apiPath = 'http://localhost:3000/api/public';
        this.adminUrl = 'http://localhost:4200';
        this.env = 'local';
        break;

      case 'www-nrts-prc-dev-public.pathfinder.gov.bc.ca':
        // Dev
        this.apiPath = 'https://prc-api-dev.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-admin-dev.pathfinder.gov.bc.ca';
        this.env = 'dev';
        break;

      case 'www-nrts-prc-test-public.pathfinder.gov.bc.ca':
        // Test
        this.apiPath = 'https://prc-api-test.pathfinder.gov.bc.ca/api/public';
        this.adminUrl = 'https://nrts-prc-admin-test.pathfinder.gov.bc.ca';
        this.env = 'test';
        break;

      default:
        // Prod
        this.apiPath = 'https://comment.nrs.gov.bc.ca/api';
        this.adminUrl = 'https://comment.nrs.gov.bc.ca/admin';
        this.env = 'prod';
    };
  }

  public handleError(error: any): ErrorObservable {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log('API error =', reason);
    return Observable.throw(reason);
  }

  //
  // Applications
  //
  getApplications() {
    const fields = [
      '_id',
      'id',

      '_addedBy',
      '_updatedBy',
      'dateAdded',
      'dateUpdated',

      'agency',
      'areaHectares',
      'businessUnit',
      'cl_files',
      'code',
      'name',
      'client',
      'description',
      'interestID',
      'internalID',
      'legalDescription',
      'location',
      'latitude',
      'longitude',
      'mapsheet',
      'postID',
      'projectDate', // TODO: change to publishDate
      'purpose',
      'subpurpose',
      'region',
      'status',
      'tenureStage',
      'tantalisID',
      'dispositionID',
      'type',
      'subtype',

      'internal'

    ];
    let queryString = 'application?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  getApplication(id: string) {
    const fields = [
      '_id',
      'id',

      '_addedBy',
      '_updatedBy',
      'dateAdded',
      'dateUpdated',

      'agency',
      'areaHectares',
      'businessUnit',
      'cl_files',
      'code',
      'name',
      'client',
      'description',
      'interestID',
      'internalID',
      'legalDescription',
      'location',
      'latitude',
      'longitude',
      'mapsheet',
      'postID',
      'projectDate', // TODO: change to publishDate
      'purpose',
      'subpurpose',
      'region',
      'status',
      'tenureStage',
      'tantalisID',
      'dispositionID',
      'type',
      'subtype',

      'internal'
    ];
    let queryString = 'application/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  //
  // Organizations
  //
  getOrganization(id: string) {
    const fields = [
      '_addedBy',
      'code',
      'name'
    ];
    let queryString = 'organization/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  //
  // Decisions
  //
  getDecisionByAppId(appId: string) {
    const fields = [
      '_addedBy',
      '_application',
      'code',
      'name',
      'description'
    ];
    let queryString = 'decision?_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  getDecision(id: string) {
    const fields = [
      '_addedBy',
      '_application',
      'code',
      'name',
      'description'
    ];
    let queryString = 'decision/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
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
      'endDate',
      'description',
      'internal'
    ];
    let queryString = 'commentperiod?isDeleted=false&_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  getPeriod(id: string) {
    const fields = [
      '_addedBy',
      '_application',
      'startDate',
      'endDate',
      'description',
      'internal'
    ];
    let queryString = 'commentperiod/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
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
    let queryString = 'comment?isDeleted=false&_commentPeriod=' + periodId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
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
    let queryString = 'comment/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  addComment(comment: Comment) {
    const fields = ['comment', 'commentAuthor'];
    let queryString = 'comment?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.post(queryString, comment);
  }

  // NOT USED
  // saveComment(comment: Comment) {
  //   const fields = ['comment', 'commentAuthor'];
  //   let queryString = 'comment/' + comment._id + '?fields=';
  //   _.each(fields, function (f) {
  //     queryString += f + '|';
  //   });
  //   // Trim the last |
  //   queryString = queryString.replace(/\|$/, '');
  //   return this.put(queryString, comment);
  // }

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
    let queryString = 'document?isDeleted=false&_application=' + appId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
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
    let queryString = 'document?isDeleted=false&_comment=' + commentId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
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
    let queryString = 'document?isDeleted=false&_decision=' + decisionId + '&fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  getDocument(id: string) {
    const queryString = 'document/' + id;
    return this.get(queryString);
  }

  uploadDocument(formData: Object) {
    const fields = [
      'displayName',
      'internalURL',
      'documentFileName',
      'internalMime'
    ];
    let queryString = 'document/?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.post(queryString, formData, { reportProgress: true });
  }

  getDocumentUrl(document: Document): string {
    return document ? (this.apiPath + '/document/' + document._id + '/download') : '';
  }

  //
  // Crown Lands files
  //
  getBCGWCrownLands(id: string) {
    const fields = ['name', 'isImported'];
    let queryString = 'search/bcgw/crownLandsId/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  getBCGWDispositionTransactionId(id: string) {
    const fields = ['name'];
    let queryString = 'search/bcgw/dispositionTransactionId/' + id + '?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  //
  // Users
  //
  getAllUsers() {
    const fields = ['displayName', 'username', 'firstName', 'lastName'];
    let queryString = 'user?fields=';
    _.each(fields, function (f) {
      queryString += f + '|';
    });
    // Trim the last |
    queryString = queryString.replace(/\|$/, '');
    return this.get(queryString);
  }

  //
  // Private
  //
  private get(apiRoute: string, options?: Object) {
    return this.http.get(`${this.apiPath}/${apiRoute}`, options || null);
  }

  private put(apiRoute: string, body?: Object, options?: Object) {
    return this.http.put(`${this.apiPath}/${apiRoute}`, body || null, options || null);
  }

  private post(apiRoute: string, body?: Object, options?: Object) {
    return this.http.post(`${this.apiPath}/${apiRoute}`, body || null, options || null);
  }
  private delete(apiRoute: string, body?: Object, options?: Object) {
    return this.http.delete(`${this.apiPath}/${apiRoute}`, options || null);
  }
}
