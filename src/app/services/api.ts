import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Params } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';


@Injectable()
export class Api {
  pathMEM: string;
  pathEPIC: string;
  hostnameMEM: string;
  hostnameEPIC: string;
  params: Params;
  env: 'local' | 'dev' | 'test' | 'prod';

  constructor(private http: Http) {
    const { hostname } = window.location;
    switch (hostname) {
      case 'localhost':
        // Local
        this.hostnameMEM  = 'http://localhost:4000';
        this.hostnameEPIC = 'http://localhost:3000';
        this.env = 'local';
        break;

      case 'www-mem-mmt-dev.pathfinder.gov.bc.ca':
        // Dev
        this.hostnameMEM  = 'https://mem-mmt-dev.pathfinder.gov.bc.ca';
        this.hostnameEPIC = 'https://esm-master.pathfinder.gov.bc.ca';
        this.env = 'dev';
        break;

      case 'www-mem-mmt-test.pathfinder.gov.bc.ca':
        // Test
        this.hostnameMEM  = 'https://mem-mmt-test.pathfinder.gov.bc.ca';
        this.hostnameEPIC = 'https://esm-test.pathfinder.gov.bc.ca';
        this.env = 'test';
        break;

      default:
        // Prod
        this.hostnameMEM  = 'https://mines.empr.gov.bc.ca';
        this.hostnameEPIC = 'https://projects.eao.gov.bc.ca';
        this.env = 'prod';
    };

    this.pathMEM  = `${ this.hostnameMEM }/api`;
    this.pathEPIC = `${ this.hostnameEPIC }/api`;
  }

  // Projects

  getProjects() {
    return this.getMEM('projects/major');
  }

  getProjectByCode(projectCode: string) {
    return this.getMEM(`projects/major/${ projectCode }`);
  }

  getProjectCollectionsMEM(projectCode: string) {
    return this.getMEM(`collections/project/${ projectCode }`);
  }

  getProjectCollectionsEPIC(projectCode: string) {
    return this.getEPIC(`collections/project/${ projectCode }`);
  }

  // Proponents

  getProponents() {
    return this.getMEM('organization');
  }

  // News

  getNews() {
    return this.getEPIC('recentactivity');
  }

  // Methods

  getMEM(apiRoute: string, options?: Object) {
    return this.get(this.pathMEM, apiRoute, options);
  }

  getEPIC(apiRoute: string, options?: Object) {
    return this.get(this.pathEPIC, apiRoute, options);
  }

  putMEM(apiRoute: string, body?: Object, options?: Object) {
    return this.put(this.pathMEM, apiRoute, body, options);
  }

  putEPIC(apiRoute: string, body?: Object, options?: Object) {
    return this.put(this.pathEPIC, apiRoute, body, options);
  }

  handleError(error: any) {
    const reason = error.message ? error.message : (error.status ? `${error.status} - ${error.statusText}` : 'Server error');
    console.log(reason);
    return Observable.throw(reason);
  }

  // Private

  private get(apiPath: string, apiRoute: string, options?: Object) {
    return this.http.get(`${ apiPath }/${ apiRoute }`, options || null);
  }

  private put(apiPath: string, apiRoute: string, body?: Object, options?: Object) {
    return this.http.put(`${ apiPath }/${ apiRoute }`, body || null, options || null);
  }
}
