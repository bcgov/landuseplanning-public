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
import { CommentPeriod } from 'app/models/commentperiod';
import { Org } from 'app/models/organization';

@Injectable()
export class ProjectService {
  private project: Project = null; // for caching
  private projectList: Project[] = [];

  constructor(
    private api: ApiService,
  ) { }

  /**
   * Get just the projects (for fast mapping).
   *
   * @param {number} pageNum
   * @param {number} pageSize
   * @param {object} regionFilters
   * @param {object} cpStatusFilters
   * @param {object} appStatusFilters
   * @param {string|null} applicantFilter
   * @param {string|null} clFileFilter
   * @param {string|null} dispIdFilter
   * @param {string|null} purposeFilter
   * @returns {Observable}
   */
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
        if (res) {
          this.projectList = [];
          res.forEach(project => {
            this.projectList.push(new Project(project));
          });
          return this.projectList;
        }
        return  [];
      })
      .catch(this.api.handleError);
  }

  /**
   * Get number of projects.
   *
   * @returns {Observable}
   */
  getCount(): Observable<number> {
    return this.api.getCountProjects()
      .catch(error => this.api.handleError(error));
  }

  /**
   * Get all projects and related data.
   *
   * @todo instead of using promises to get all data at once, use observables and DEEP-OBSERVE changes.
   * @see https://github.com/angular/angular/issues/11704
   *
   * @param {number} pageNum
   * @param {number} pageSize
   * @param {object} regionFilters
   * @param {object} cpStatusFilters
   * @param {object} appStatusFilters
   * @param {string|null} applicantFilter
   * @param {string|null} clFileFilter
   * @param {string|null} dispIdFilter
   * @param {string|null} purposeFilter
   * @returns {Observable}
   */
  getAllFull(pageNum: number = 0, pageSize: number = 1000000, regionFilters: object = {}, cpStatusFilters: object = {}, appStatusFilters: object = {},
    applicantFilter: string = null, clFileFilter: string = null, dispIdFilter: string = null, purposeFilter: string = null): Observable<Project[]> {
    // first get the projects
    return this.getAll(pageNum, pageSize, regionFilters, cpStatusFilters, appStatusFilters, applicantFilter, clFileFilter, dispIdFilter, purposeFilter)
      .mergeMap((projects: any) => {
        if (projects.length === 0) {
          return Observable.of([] as Project[]);
        }
        const promises: Array<Promise<any>> = [];

        return Promise.all(promises).then(() => { return projects; });
      })
      .catch(this.api.handleError);
  }

  /**
   * Get project by ID.
   *
   * @param {string} projId
   * @param {boolean} forceReload
   * @param {string|null} cpStart
   * @param {string|null} cpEnd
   * @returns {Observable}
   */
  getById(projId: string, forceReload: boolean = false, cpStart: string = null, cpEnd: string = null): Observable<Project> {
    if (this.project && this.project._id === projId && !forceReload) {
      return Observable.of(this.project);
    }
    // First get the project.
    return this.api.getProject(projId, cpStart, cpEnd)
      .map(projects => {
        if (projects[0].commentPeriodForBanner && projects[0].commentPeriodForBanner.length > 0) {
          projects[0].commentPeriodForBanner = new CommentPeriod(projects[0].commentPeriodForBanner[0]);
        } else {
          projects[0].commentPeriodForBanner = null;
        }
        // Return the first (only) project.
        return projects.length > 0 ? new Project(projects[0]) : null;
      })
      .catch(this.api.handleError);
  }

  /**
   * Get project pins.
   *
   * @param {string} proj
   * @param {number} pageNum
   * @param {number} pageSize
   * @param {any} sortBy
   * @returns {Observable}
   */
  getPins(proj: string, pageNum: number, pageSize: number, sortBy: any): Observable<Org> {
    return this.api.getProjectPins(proj, pageNum, pageSize, sortBy)
    .catch(error => this.api.handleError(error));
  }
}
