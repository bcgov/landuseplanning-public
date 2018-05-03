import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Constants } from 'app/utils/constants';
import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { MainMapComponent } from 'app/map/main-map/main-map.component';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  @ViewChild(MainMapComponent) mainMap: MainMapComponent;

  public loading = true;
  public cpStatusKeys: Array<string> = [];
  public appStatusKeys: Array<string> = [];
  private paramMap: ParamMap = null;
  private allApps: Array<Application> = [];
  public filteredApps: Array<Application> = []; // FUTURE: add filtered property to allApps instead (single array)
  public currentApp: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // public showFilters = true;
  public cpStatusFilters: Object = {}; // array-like object
  public appStatusFilters: Object = {}; // array-like object
  public applicantFilter: string = null;
  public clFileFilter: number = null;
  public dispIdFilter: number = null;
  public purposeFilter: string = null;

  private applicantKeys: Array<string> = [];
  private clFileKeys: Array<number> = [];
  private dispIdKeys: Array<number> = [];
  private purposeKeys: Array<string> = [];

  //
  // (arrow) functions to return type-ahead results
  // ref: https://ng-bootstrap.github.io/#/components/typeahead/api
  //
  applicantSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.applicantKeys.filter(key => key.indexOf(this.applicantFilter.toUpperCase()) > -1) // .slice(0, 10)
      );

  clFileSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.clFileKeys.filter(key => key.toString().indexOf(this.clFileFilter.toString()) > -1) // .slice(0, 10)
      );

  dispIdSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.dispIdKeys.filter(key => key.toString().indexOf(this.dispIdFilter.toString()) > -1) // .slice(0, 10)
      );

  purposeSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.purposeKeys.filter(key => key.indexOf(this.purposeFilter.toUpperCase()) > -1) // .slice(0, 10)
      );

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // also used in template
  ) {
    // populate the keys we want to display
    this.cpStatusKeys.push(this.commentPeriodService.OPEN);
    this.cpStatusKeys.push(this.commentPeriodService.NOT_STARTED);
    this.cpStatusKeys.push(this.commentPeriodService.CLOSED);
    this.cpStatusKeys.push(this.commentPeriodService.NOT_OPEN);

    this.appStatusKeys.push(this.applicationService.ACCEPTED);
    this.appStatusKeys.push(this.applicationService.DECISION_MADE);
    this.appStatusKeys.push(this.applicationService.CANCELLED);
    this.appStatusKeys.push(this.applicationService.ABANDONED);
    this.appStatusKeys.push(this.applicationService.DISPOSITION_GOOD_STANDING);
    this.appStatusKeys.push(this.applicationService.SUSPENDED);
  }

  ngOnInit() {
    // get optional query parameters
    this.route.queryParamMap
      .takeUntil(this.ngUnsubscribe)
      .subscribe(paramMap => {
        this.paramMap = paramMap;

        // set initial filters
        this.resetFilters(null);
      });

    // get data
    this.applicationService.getAll()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(applications => {
        // sort by newest first
        this.allApps = applications.sort((a: Application, b: Application) => {
          return (a.publishDate < b.publishDate) ? 1 : -1;
        });

        // store keys for faster filter lookahead
        // don't include empty results, then sort results, and then remove duplicates
        this.applicantKeys = _.sortedUniq(_.compact(this.allApps.map(app => app.client ? app.client.toUpperCase() : null)).sort());
        this.clFileKeys = _.sortedUniq(_.compact(this.allApps.map(app => app.cl_file)).sort());
        this.dispIdKeys = _.compact(this.allApps.map(app => app.tantalisID)).sort(); // should already be unique

        Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
          Constants.subpurposes[purpose].forEach(subpurpose => {
            this.purposeKeys.push(purpose.toUpperCase() + ' / ' + subpurpose.toUpperCase());
          });
        });

        // apply initial filtering
        this.applyFilters(null);

        // draw the initial map
        this.mainMap.drawMap(this.filteredApps);

        this.loading = false;
      }, error => {
        console.log(error);
        alert('Uh-oh, couldn\'t load applications');
        this.loading = false;
        // applications not found --> navigate back to home
        this.router.navigate(['/']);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // public getShowFilters(): boolean {
  //   return (this.showFilters);
  // }

  // public setShowFilters(tf: boolean) {
  //   this.showFilters = tf;
  // }

  public isCurrentApp(item): boolean {
    return (item === this.currentApp);
  }

  // event handler to set visibility of specified list item
  public visibleLayer(item) {
    const app = _.find(this.filteredApps, { tantalisID: item.tantalisID });
    if (app) {
      app.isVisible = item.isVisible;
    }
  }

  private setCurrentApp(item) {
    const index = _.findIndex(this.filteredApps, { _id: item._id });
    if (index >= 0) {
      this.filteredApps.splice(index, 1, item);
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
        this.mainMap.highlightApplication(item, true);
      } else {
        this.currentApp = null; // unset
        this.mainMap.highlightApplication(item, false);
      }
    }
  }

  public applyFilters(e: Event) {
    this.filteredApps = this.allApps.filter(app => this.showThisApp(app));

    // if called from UI, save new filters and redraw map
    // otherwise this is part of init
    if (e) {
      this.saveFilters();
      e.preventDefault();
      this.mainMap.drawMap(this.filteredApps);
    }
  }

  private showThisApp(item: Application) {
    // if no option is selected, match all
    const allCpStatus = this.cpStatusKeys.every(key => {
      return (this.cpStatusFilters[key] === false);
    });

    const matchCpStatus = (
      allCpStatus
      || (this.cpStatusFilters[this.commentPeriodService.OPEN]
        && this.commentPeriodService.isOpen(item.currentPeriod))
      || (this.cpStatusFilters[this.commentPeriodService.NOT_STARTED]
        && this.commentPeriodService.isNotStarted(item.currentPeriod))
      || (this.cpStatusFilters[this.commentPeriodService.CLOSED]
        && this.commentPeriodService.isClosed(item.currentPeriod))
      || (this.cpStatusFilters[this.commentPeriodService.NOT_OPEN]
        && this.commentPeriodService.isNotOpen(item.currentPeriod))
    );

    // if no option is selected, match all
    const allAppStatus = this.appStatusKeys.every(key => {
      return (this.appStatusFilters[key] === false);
    });

    const matchAppStatus = (
      allAppStatus
      || (this.appStatusFilters[this.applicationService.ACCEPTED]
        && this.applicationService.isAccepted(item.status))
      || (this.appStatusFilters[this.applicationService.DECISION_MADE]
        && this.applicationService.isDecision(item.status)
        && !this.applicationService.isCancelled(item.status))
      || (this.appStatusFilters[this.applicationService.CANCELLED]
        && this.applicationService.isCancelled(item.status))
      || (this.appStatusFilters[this.applicationService.ABANDONED]
        && this.applicationService.isAbandoned(item.status))
      || (this.appStatusFilters[this.applicationService.DISPOSITION_GOOD_STANDING]
        && this.applicationService.isDispGoodStanding(item.status))
      || (this.appStatusFilters[this.applicationService.SUSPENDED]
        && this.applicationService.isSuspended(item.status))
    );

    const matchApplicant = !this.applicantFilter || !item.client
      || item.client.toUpperCase().indexOf(this.applicantFilter.toUpperCase()) > -1;

    const matchCLFile = !this.clFileFilter || !item.cl_file
      || item.cl_file.toString().indexOf(this.clFileFilter.toString()) > -1;

    const matchDispId = !this.dispIdFilter || !item.tantalisID ||
      item.tantalisID.toString().indexOf(this.dispIdFilter.toString()) > -1;

    const matchPurpose = !this.purposeFilter || !item.purpose || !item.subpurpose
      || item.purpose.toUpperCase().indexOf(this.purposeFilter.toUpperCase()) > -1
      || item.subpurpose.toUpperCase().indexOf(this.purposeFilter.toUpperCase()) > -1;

    return matchCpStatus && matchAppStatus && matchApplicant && matchCLFile && matchDispId && matchPurpose;
  }

  private saveFilters() {
    const params: Params = {};

    this.cpStatusKeys.forEach(key => {
      if (this.cpStatusFilters[key]) {
        if (!params['cpStatus']) {
          params['cpStatus'] = key;
        } else {
          params['cpStatus'] += ',' + key;
        }
      }
    });

    this.appStatusKeys.forEach(key => {
      if (this.appStatusFilters[key]) {
        if (!params['appStatus']) {
          params['appStatus'] = key;
        } else {
          params['appStatus'] += ',' + key;
        }
      }
    });

    if (this.applicantFilter) {
      params['applicant'] = this.applicantFilter;
    }

    // check length in case user entered then deleted value
    if (this.clFileFilter && this.clFileFilter.toString().length > 0) {
      params['clFile'] = this.clFileFilter;
    }

    // check length in case user entered then deleted value
    if (this.dispIdFilter && this.dispIdFilter.toString().length > 0) {
      params['dispId'] = this.dispIdFilter;
    }

    if (this.purposeFilter) {
      params['purpose'] = this.purposeFilter;
    }

    // change browser URL without reloading page (so any query params are saved in history)
    this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: params }).toString());
  }

  public resetFilters(e: Event) {
    // set cpStatus filters according to current param options
    const cpStatuses = (this.paramMap.get('cpStatus') || '').split(',');
    this.cpStatusKeys.forEach(key => {
      this.cpStatusFilters[key] = cpStatuses.includes(key);
    });

    // set appStatus filters according to current param options
    const appStatuses = (this.paramMap.get('appStatus') || '').split(',');
    this.appStatusKeys.forEach(key => {
      this.appStatusFilters[key] = appStatuses.includes(key);
    });

    this.applicantFilter = this.paramMap.get('applicant');
    this.clFileFilter = this.paramMap.get('clFile') ? +this.paramMap.get('clFile') : null;
    this.dispIdFilter = this.paramMap.get('dispId') ? +this.paramMap.get('dispId') : null;
    this.purposeFilter = this.paramMap.get('purpose');

    // if called from UI, apply new filters
    // otherwise this is part of init
    if (e) {
      this.applyFilters(e);
    }
  }

  public clearFilters(e: Event) {
    this.cpStatusKeys.forEach(key => {
      this.cpStatusFilters[key] = false;
    });

    this.appStatusKeys.forEach(key => {
      this.appStatusFilters[key] = false;
    });

    this.applicantFilter = null;
    this.clFileFilter = null;
    this.dispIdFilter = null;
    this.purposeFilter = null;

    // if called from UI, apply new filters
    // otherwise this is part of init
    if (e) {
      this.applyFilters(e);
    }
  }

  public cpStatusCount(): number {
    return this.cpStatusKeys.filter(key => this.cpStatusFilters[key]).length;
  }

  public appStatusCount(): number {
    return this.appStatusKeys.filter(key => this.appStatusFilters[key]).length;
  }

  public appsCount(): number {
    return this.filteredApps.filter(app => app.isVisible).length;
  }

}
