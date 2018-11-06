import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Constants } from 'app/utils/constants';
import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';

export interface FiltersType {
  regionFilters: object;
  cpStatusFilters: object;
  appStatusFilters: object;
  applicantFilter: string;
  clFileFilter: string;
  dispIdFilter: string;
  purposeFilter: string;
  publishFromFilter: Date;
  publishToFilter: Date;
}

@Component({
  selector: 'app-applist-filters',
  templateUrl: './applist-filters.component.html',
  styleUrls: ['./applist-filters.component.scss']
})

export class ApplistFiltersComponent implements OnInit, OnChanges, OnDestroy {
  // NB: this component is bound to the same list of apps as the other components
  @Input() applications: Array<Application> = []; // from applications component
  @Output() updateMatching = new EventEmitter(); // to applications component

  readonly minDate = moment('2018-03-23').toDate(); // first app created
  readonly maxDate = moment().toDate(); // today

  public isFiltersCollapsed: boolean;
  public isCpStatusCollapsed = true;
  public isAppStatusCollapsed = true;
  public loading = false;
  private paramMap: ParamMap = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for drop-down menus
  public regionKeys: Array<string> = [];
  public cpStatusKeys: Array<string> = [];
  public appStatusKeys: Array<string> = [];

  // search keys for text boxes
  private applicantKeys: Array<string> = [];
  // private clFileKeys: Array<number> = []; // NOT CURRENTLY USED
  // private dispIdKeys: Array<number> = []; // NOT CURRENTLY USED
  private purposeKeys: Array<string> = [];

  public regionFilters: object = {}; // array-like object
  public _regionFilters: object = {}; // temporary filters for Cancel feature

  public cpStatusFilters: object = {}; // array-like object
  public _cpStatusFilters: object = {}; // temporary filters for Cancel feature

  public appStatusFilters: object = {}; // array-like object
  public _appStatusFilters: object = {}; // temporary filters for Cancel feature

  public applicantFilter: string = null;
  public _applicantFilter: string = null; // temporary filters for Cancel feature

  public clFileFilter: number = null;
  public _clFileFilter: number = null; // temporary filters for Cancel feature

  public dispIdFilter: number = null;
  public _dispIdFilter: number = null; // temporary filters for Cancel feature

  public purposeFilter: string = null;
  public _purposeFilter: string = null; // temporary filters for Cancel feature

  public publishFromFilter: Date = null;
  public publishToFilter: Date = null;
  public _publishFromFilter: Date = null; // temporary filters for Cancel feature
  public _publishToFilter: Date = null; // temporary filters for Cancel feature

  //
  // (arrow) functions to return type-ahead results
  // ref: https://ng-bootstrap.github.io/#/components/typeahead/api
  //
  public applicantSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.applicantKeys.filter(key => key.indexOf(this._applicantFilter.toUpperCase()) > -1) // .slice(0, 10)
      );

  // NOT CURRENTLY USED
  // public clFileSearch = (text$: Observable<string>) =>
  //   text$
  //     .debounceTime(200)
  //     .distinctUntilChanged()
  //     .map(term => term.length < 1 ? []
  //       : this.clFileKeys.filter(key => key.toString().indexOf(this._clFileFilter.toString()) > -1) // .slice(0, 10)
  //     );

  // NOT CURRENTLY USED
  // public dispIdSearch = (text$: Observable<string>) =>
  //   text$
  //     .debounceTime(200)
  //     .distinctUntilChanged()
  //     .map(term => term.length < 1 ? []
  //       : this.dispIdKeys.filter(key => key.toString().indexOf(this._dispIdFilter.toString()) > -1) // .slice(0, 10)
  //     );

  public purposeSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.purposeKeys.filter(key => key.indexOf(this._purposeFilter.toUpperCase()) > -1) // .slice(0, 10)
      );

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService, // also used in template
    private configService: ConfigService,
    private elementRef: ElementRef
  ) {
    // populate the keys we want to display
    this.regionKeys.push(this.applicationService.CARIBOO);
    this.regionKeys.push(this.applicationService.KOOTENAY);
    this.regionKeys.push(this.applicationService.LOWER_MAINLAND);
    this.regionKeys.push(this.applicationService.OMENICA);
    this.regionKeys.push(this.applicationService.PEACE);
    this.regionKeys.push(this.applicationService.SKEENA);
    this.regionKeys.push(this.applicationService.SOUTHERN_INTERIOR);
    this.regionKeys.push(this.applicationService.VANCOUVER_ISLAND);

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

  // full height = top of app-applist-filters.app-filters + height of div.app-filters__header
  get clientHeight(): number {
    return this.elementRef.nativeElement.offsetTop + this.elementRef.nativeElement.firstElementChild.firstElementChild.clientHeight;
  }

  public ngOnInit() {
    this.isFiltersCollapsed = !this.configService.isApplistFiltersVisible;

    // get optional query parameters
    this.route.queryParamMap
      .takeUntil(this.ngUnsubscribe)
      .subscribe(paramMap => {
        this.paramMap = paramMap;

        // set filters according to paramMap
        this.internalResetAllFilters(false);
      });

    // load this list just once as it doesn't change
    Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
      Constants.subpurposes[purpose].forEach(subpurpose => {
        this.purposeKeys.push(purpose.toUpperCase() + ' / ' + subpurpose.toUpperCase());
      });
    });
  }

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.applications && !changes.applications.firstChange && changes.applications.currentValue) {
      // console.log('filters: got apps from applications component');
      // console.log('# apps =', this.applications.length);

      // store keys for faster filter lookahead
      // don't include empty results, then sort results, and then remove duplicates
      // NB: these look only at currently-loaded apps -- not all the possible apps in the system
      this.applicantKeys = _.sortedUniq(_.compact(this.applications.map(app => app.client ? app.client.toUpperCase() : null)).sort());
      // this.clFileKeys = _.sortedUniq(_.compact(this.applications.map(app => app.cl_file)).sort()); // NOT CURRENTLY USED
      // this.dispIdKeys = _.compact(this.applications.map(app => app.tantalisID)).sort(); // should already be unique // NOT CURRENTLY USED

      // (re)apply filtering
      this.internalApplyAllFilters(false);
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // FOR FUTURE USE
  public getFilters(): FiltersType {
    return {
      regionFilters: this.regionFilters,
      cpStatusFilters: this.cpStatusFilters,
      appStatusFilters: this.appStatusFilters,
      applicantFilter: this.applicantFilter && this.applicantFilter.trim(),
      clFileFilter: this.clFileFilter ? this.clFileFilter.toString() : null,
      dispIdFilter: this.dispIdFilter ? this.dispIdFilter.toString() : null,
      purposeFilter: this.purposeFilter && this.purposeFilter.trim(),
      publishFromFilter: this.publishFromFilter,
      publishToFilter: this.publishToFilter
    };
  }

  //
  // The following are to "Apply" the temporary filters: copy the temporary values to the actual variables, etc.
  //
  public applyRegionFilters() {
    this.regionFilters = { ...this._regionFilters };
    this.internalApplyAllFilters(true);
    // this.isRegionCollapsed = true; // FUTURE
  }

  public applyCpStatusFilters() {
    this.cpStatusFilters = { ...this._cpStatusFilters };
    this.internalApplyAllFilters(true);
    this.isCpStatusCollapsed = true;
  }

  public applyAppStatusFilters() {
    this.appStatusFilters = { ...this._appStatusFilters };
    this.internalApplyAllFilters(true);
    this.isAppStatusCollapsed = true;
  }

  public applyClFileFilter() {
    this.clFileFilter = this._clFileFilter;
    this.internalApplyAllFilters(true);
  }

  public applyAllFilters() {
    this.regionFilters = { ...this._regionFilters };
    this.cpStatusFilters = { ...this._cpStatusFilters };
    this.appStatusFilters = { ...this._appStatusFilters };
    this.applicantFilter = this._applicantFilter;
    this.clFileFilter = this._clFileFilter;
    this.dispIdFilter = this._dispIdFilter;
    this.purposeFilter = this._purposeFilter;
    this.publishFromFilter = this._publishFromFilter;
    this.publishToFilter = this._publishToFilter;

    this.internalApplyAllFilters(true);
  }

  private internalApplyAllFilters(doSave: boolean) {
    this.applications.forEach(app => app.isMatches = this.showThisApp(app));

    // notify map component
    this.updateMatching.emit();

    // if called from UI, save new filters
    // otherwise this is part of init or change event
    if (doSave) {
      this.saveFilters();
    }
  }

  // returns 'true' if all filters match
  private showThisApp(item: Application): boolean {
    let retVal = true; // for short-circuiting checks

    // if no option is selected, match all
    const allRegions = this.regionKeys.every(key => {
      return (this.regionFilters[key] === false);
    });

    // check for matching region
    retVal = retVal && (
      allRegions ||
      (this.regionFilters[this.applicationService.CARIBOO] && (item.region === this.applicationService.CARIBOO)) ||
      (this.regionFilters[this.applicationService.KOOTENAY] && (item.region === this.applicationService.KOOTENAY)) ||
      (this.regionFilters[this.applicationService.LOWER_MAINLAND] && (item.region === this.applicationService.LOWER_MAINLAND)) ||
      (this.regionFilters[this.applicationService.OMENICA] && (item.region === this.applicationService.OMENICA)) ||
      (this.regionFilters[this.applicationService.PEACE] && (item.region === this.applicationService.PEACE)) ||
      (this.regionFilters[this.applicationService.SKEENA] && (item.region === this.applicationService.SKEENA)) ||
      (this.regionFilters[this.applicationService.SOUTHERN_INTERIOR] && (item.region === this.applicationService.SOUTHERN_INTERIOR)) ||
      (this.regionFilters[this.applicationService.VANCOUVER_ISLAND] && (item.region === this.applicationService.VANCOUVER_ISLAND))
    );

    // if no option is selected, match all
    const allCpStatuses = this.cpStatusKeys.every(key => {
      return (this.cpStatusFilters[key] === false);
    });

    // check for matching Comment Period Status
    retVal = retVal && (
      allCpStatuses ||
      (this.cpStatusFilters[this.commentPeriodService.OPEN] && this.commentPeriodService.isOpen(item.currentPeriod)) ||
      (this.cpStatusFilters[this.commentPeriodService.NOT_STARTED] && this.commentPeriodService.isNotStarted(item.currentPeriod)) ||
      (this.cpStatusFilters[this.commentPeriodService.CLOSED] && this.commentPeriodService.isClosed(item.currentPeriod)) ||
      (this.cpStatusFilters[this.commentPeriodService.NOT_OPEN] && this.commentPeriodService.isNotOpen(item.currentPeriod))
    );

    // if no option is selected, match all
    const allAppStatuses = this.appStatusKeys.every(key => {
      return (this.appStatusFilters[key] === false);
    });

    // check for matching Application Status
    const appStatusCode = this.applicationService.getStatusCode(item.status);
    retVal = retVal && (
      allAppStatuses ||
      (this.appStatusFilters[this.applicationService.ACCEPTED] && this.applicationService.isAccepted(appStatusCode)) ||
      (this.appStatusFilters[this.applicationService.DECISION_MADE] && this.applicationService.isDecision(appStatusCode) && !this.applicationService.isCancelled(appStatusCode)) ||
      (this.appStatusFilters[this.applicationService.CANCELLED] && this.applicationService.isCancelled(appStatusCode)) ||
      (this.appStatusFilters[this.applicationService.ABANDONED] && this.applicationService.isAbandoned(appStatusCode)) ||
      (this.appStatusFilters[this.applicationService.DISPOSITION_GOOD_STANDING] && this.applicationService.isDispGoodStanding(appStatusCode)) ||
      (this.appStatusFilters[this.applicationService.SUSPENDED] && this.applicationService.isSuspended(appStatusCode))
    );

    // check for matching Applicant
    const applicantFilter = this.applicantFilter && this.applicantFilter.trim(); // returns null or empty
    retVal = retVal && (
      !this.applicantFilter || !item.client ||
      item.client.toUpperCase().indexOf(applicantFilter.toUpperCase()) > -1
    );

    // check for matching CL File
    retVal = retVal && (
      !this.clFileFilter || !item.cl_file ||
      item.cl_file.toString().indexOf(this.clFileFilter.toString()) > -1
    );

    // check for matching Disposition ID
    retVal = retVal && (
      !this.dispIdFilter || !item.tantalisID ||
      item.tantalisID.toString().indexOf(this.dispIdFilter.toString()) > -1
    );

    // check for matching Purpose / Sub-purpose
    const purposeSubpurpose = `${item.purpose} / ${item.subpurpose}`;
    const purposeFilter = this.purposeFilter && this.purposeFilter.trim(); // returns null or empty
    retVal = retVal && (
      !this.purposeFilter || !item.purpose || !item.subpurpose ||
      purposeSubpurpose.toUpperCase().indexOf(purposeFilter.toUpperCase()) > -1
    );

    // check for Publish Date range
    if (retVal && item.publishDate) {
      const publishDay = moment(item.publishDate).startOf('day').toDate(); // date only
      retVal = (
        (!this.publishFromFilter || publishDay >= this.publishFromFilter)
        &&
        (!this.publishToFilter || publishDay <= this.publishToFilter)
      );
    }

    return retVal;
  }

  private saveFilters() {
    const params: Params = {}; // array-like object

    this.regionKeys.forEach(key => {
      if (this.regionFilters[key]) {
        if (!params['regions']) {
          params['regions'] = key;
        } else {
          params['regions'] += ',' + key;
        }
      }
    });

    this.cpStatusKeys.forEach(key => {
      if (this.cpStatusFilters[key]) {
        if (!params['cpStatuses']) {
          params['cpStatuses'] = key;
        } else {
          params['cpStatuses'] += ',' + key;
        }
      }
    });

    this.appStatusKeys.forEach(key => {
      if (this.appStatusFilters[key]) {
        if (!params['appStatuses']) {
          params['appStatuses'] = key;
        } else {
          params['appStatuses'] += ',' + key;
        }
      }
    });

    const applicantFilter = this.applicantFilter && this.applicantFilter.trim(); // returns null or empty
    if (applicantFilter) {
      params['applicant'] = applicantFilter;
    }

    // check length in case user entered then deleted value
    if (this.clFileFilter && this.clFileFilter.toString().length > 0) {
      params['clFile'] = this.clFileFilter;
    }

    // check length in case user entered then deleted value
    if (this.dispIdFilter && this.dispIdFilter.toString().length > 0) {
      params['dispId'] = this.dispIdFilter;
    }

    const purposeFilter = this.purposeFilter && this.purposeFilter.trim(); // returns null or empty
    if (purposeFilter) {
      params['purpose'] = purposeFilter;
    }

    if (this.publishFromFilter) {
      params['publishFrom'] = moment(this.publishFromFilter).format('YYYY-MM-DD');
    }

    if (this.publishToFilter) {
      params['publishTo'] = moment(this.publishToFilter).format('YYYY-MM-DD');
    }

    // change browser URL without reloading page (so any query params are saved in history)
    this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: params }).toString());
  }

  //
  // The following are to "Cancel" the temporary filters: just reset the values.
  //
  public cancelRegionFilters() {
    this._regionFilters = { ...this.regionFilters };
    // this.isRegionCollapsed = true; // FUTURE
  }

  public cancelCpStatusFilters() {
    this._cpStatusFilters = { ...this.cpStatusFilters };
    this.isCpStatusCollapsed = true;
  }

  public cancelAppStatusFilters() {
    this._appStatusFilters = { ...this.appStatusFilters };
    this.isAppStatusCollapsed = true;
  }

  public cancelAllFilters() {
    this._regionFilters = { ...this.regionFilters };
    this._cpStatusFilters = { ...this.cpStatusFilters };
    this._appStatusFilters = { ...this.appStatusFilters };
    this._applicantFilter = this.applicantFilter;
    this._clFileFilter = this.clFileFilter;
    this._dispIdFilter = this.dispIdFilter;
    this._purposeFilter = this.purposeFilter;
    this._publishFromFilter = this.publishFromFilter;
    this._publishToFilter = this.publishToFilter;
  }

  public resetAllFilters() {
    this.internalResetAllFilters(true);
  }

  // (re)sets all filters from current param map
  private internalResetAllFilters(doApply: boolean) {
    if (this.paramMap) {
      // set region filters according to current param options
      const regions = (this.paramMap.get('regions') || '').split(',');
      this.regionKeys.forEach(key => {
        this.regionFilters[key] = regions.includes(key);
      });

      // set cpStatus filters according to current param options
      const cpStatuses = (this.paramMap.get('cpStatuses') || '').split(',');
      this.cpStatusKeys.forEach(key => {
        this.cpStatusFilters[key] = cpStatuses.includes(key);
      });

      // set appStatus filters according to current param options
      const appStatuses = (this.paramMap.get('appStatuses') || '').split(',');
      this.appStatusKeys.forEach(key => {
        this.appStatusFilters[key] = appStatuses.includes(key);
      });

      this.applicantFilter = this.paramMap.get('applicant');
      this.clFileFilter = this.paramMap.get('clFile') ? +this.paramMap.get('clFile') : null;
      this.dispIdFilter = this.paramMap.get('dispId') ? +this.paramMap.get('dispId') : null;
      this.purposeFilter = this.paramMap.get('purpose');
      this.publishFromFilter = this.paramMap.get('publishFrom') ? moment(this.paramMap.get('publishFrom')).toDate() : null;
      this.publishToFilter = this.paramMap.get('publishTo') ? moment(this.paramMap.get('publishTo')).toDate() : null;

      // copy all data from actual to temporary properties
      this._regionFilters = { ...this.regionFilters };
      this._cpStatusFilters = { ...this.cpStatusFilters };
      this._appStatusFilters = { ...this.appStatusFilters };
      this._applicantFilter = this.applicantFilter;
      this._clFileFilter = this.clFileFilter;
      this._dispIdFilter = this.dispIdFilter;
      this._purposeFilter = this.purposeFilter;
      this._publishFromFilter = this.publishFromFilter;
      this._publishToFilter = this.publishToFilter;
    }

    // if called from UI, apply new filters
    // otherwise this was called internally (eg, init)
    if (doApply) {
      this.internalApplyAllFilters(true);
    }
  }

  //
  // The following are to "Clear" the temporary filters.
  //
  public clearRegionFilters() {
    this.regionKeys.forEach(key => {
      this._regionFilters[key] = false;
    });
    this.applyRegionFilters();
  }

  public clearCpStatusFilters() {
    this.cpStatusKeys.forEach(key => {
      this._cpStatusFilters[key] = false;
    });
    this.applyCpStatusFilters();
  }

  public clearAppStatusFilters() {
    this.appStatusKeys.forEach(key => {
      this._appStatusFilters[key] = false;
    });
    this.applyAppStatusFilters();
  }

  public clearAllFilters() {
    this.clearRegionFilters();
    this.clearCpStatusFilters();
    this.clearAppStatusFilters();
    this._applicantFilter = null;
    this._clFileFilter = null;
    this._dispIdFilter = null;
    this._purposeFilter = null;
    this._publishFromFilter = null;
    this._publishToFilter = null;

    this.applyAllFilters();
  }

  public regionCount(): number {
    return this.regionKeys.filter(key => this.regionFilters[key]).length;
  }

  public cpStatusCount(): number {
    return this.cpStatusKeys.filter(key => this.cpStatusFilters[key]).length;
  }

  public appStatusCount(): number {
    return this.appStatusKeys.filter(key => this.appStatusFilters[key]).length;
  }

  private applicantFilterCount(): number {
    const applicantFilter = this.applicantFilter && this.applicantFilter.trim(); // returns null or empty
    return applicantFilter ? 1 : 0;
  }

  private clFileFilterCount(): number {
    return (this.clFileFilter && this.clFileFilter.toString().length > 0) ? 1 : 0;
  }

  private dispIdFilterCount(): number {
    return (this.dispIdFilter && this.dispIdFilter.toString().length > 0) ? 1 : 0;
  }

  private purposeFilterCount(): number {
    const purposeFilter = this.purposeFilter && this.purposeFilter.trim();  // returns null or empty
    return purposeFilter ? 1 : 0;
  }

  private publishFilterCount(): number {
    return (this.publishFromFilter || this.publishToFilter) ? 1 : 0;
  }

  public filterCount(): number {
    return this.regionCount()
      + this.cpStatusCount()
      + this.appStatusCount()
      + this.applicantFilterCount()
      + this.clFileFilterCount()
      + this.dispIdFilterCount()
      + this.purposeFilterCount()
      + this.publishFilterCount();
  }

  public regionHasChanges(): boolean {
    return !_.isEqual(this._regionFilters, this.regionFilters);
  }

  public cpStatusHasChanges(): boolean {
    return !_.isEqual(this._cpStatusFilters, this.cpStatusFilters);
  }

  public appStatusHasChanges(): boolean {
    return !_.isEqual(this._appStatusFilters, this.appStatusFilters);
  }

  public onShowHideClick() {
    this.configService.isApplistFiltersVisible = !this.isFiltersCollapsed;
  }

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }
}
