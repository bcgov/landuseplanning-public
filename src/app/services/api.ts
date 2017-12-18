import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

@Injectable()
export class Api {
  pathAPI: string;
  params: Params;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(private http: Http) {
    const { hostname } = window.location;
    switch (hostname) {
      case 'localhost':
        // Local
        this.pathAPI = 'http://localhost:3000/api';
        this.env = 'local';
        break;

      case 'www-nrts-prc-dev.pathfinder.gov.bc.ca':
        // Dev
        this.pathAPI = 'https://nrts-prc-dev.pathfinder.gov.bc.ca/api';
        this.env = 'dev';
        break;

      case 'www-nrts-prc-test.pathfinder.gov.bc.ca':
        // Test
        this.pathAPI = 'https://nrts-prc-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      default:
        // Prod
        this.pathAPI = 'https://';
        this.env = 'prod';
    };
  }

  // Applications
  getApplications() {
    return this.getApps('public/application');
  }

  getApplicationByCode(code: string) {
    return this.getApps('public/application/code/' + code);
  }

  getDocuments(id: string) {
    return this.get(this.pathAPI, 'public/documents/' + id);
  }

  // Methods
  getApps(apiRoute: string, options?: Object) {
    return this.get(this.pathAPI, apiRoute, options);
  }

  putApps(apiRoute: string, body?: Object, options?: Object) {
    return this.put(this.pathAPI, apiRoute, body, options);
  }

  handleError(error: any) {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log(reason);
    return Observable.throw(reason);
  }

  // Private
  private get(apiPath: string, apiRoute: string, options?: Object) {
    return this.http.get(`${apiPath}/${apiRoute}`, options || null);
  }

  private put(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    return this.http.put(`${apiPath}/${apiRoute}`, body || null, options || null);
  }
}
