import { Component, OnInit, OnDestroy, Output, EventEmitter, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Constants } from 'app/utils/constants';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';
import { UrlService } from 'app/services/url.service';

export interface FiltersType {
  regions: Array<string>;
  cpStatuses: Array<string>;
  appStatuses: Array<string>;
  applicant: string;
  clFile: string;
  dispId: string;
  purpose: string;
  subpurpose: string;
  publishFrom: Date;
  publishTo: Date;
}

@Component({
  selector: 'app-applist-filters',
  templateUrl: './applist-filters.component.html',
  styleUrls: ['./applist-filters.component.scss']
})

export class ApplistFiltersComponent implements OnInit, OnDestroy {
  @Output() updateFilters = new EventEmitter(); // to applications component

  readonly minDate = moment('2018-03-23').toDate(); // first app created
  readonly maxDate = moment().toDate(); // today

  public isRegionCollapsed = true;
  public isCpStatusCollapsed = true;
  public isAppStatusCollapsed = true;
  public loading = true; // init
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for drop-down menus
  public regionKeys: Array<string> = [];
  public cpStatusKeys: Array<string> = [];
  public appStatusKeys: Array<string> = [];

  // search keys for text boxes
  private purposeKeys: Array<string> = [];
  private subpurposeKeys: Array<string> = [];

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

  public subpurposeFilter: string = null;
  public _subpurposeFilter: string = null; // temporary filters for Cancel feature

  public publishFromFilter: Date = null;
  public _publishFromFilter: Date = null; // temporary filters for Cancel feature

  public publishToFilter: Date = null;
  public _publishToFilter: Date = null; // temporary filters for Cancel feature

  // (arrow) functions to return type-ahead results
  // ref: https://ng-bootstrap.github.io/#/components/typeahead/api
  public purposeSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.purposeKeys.filter(key => key.indexOf(this._purposeFilter.toUpperCase()) > -1) // .slice(0, 10)
      );

  public subpurposeSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 1 ? []
        : this.subpurposeKeys.filter(key => key.indexOf(this._subpurposeFilter.toUpperCase()) > -1) // .slice(0, 10)
      );

  constructor(
    private applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService, // also used in template
    public configService: ConfigService, // used in template
    private urlService: UrlService,
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
    this.cpStatusKeys.push(this.commentPeriodService.NOT_OPEN);

    this.appStatusKeys.push(this.applicationService.ACCEPTED);
    this.appStatusKeys.push(this.applicationService.DECISION_MADE);
    this.appStatusKeys.push(this.applicationService.CANCELLED);
    this.appStatusKeys.push(this.applicationService.ABANDONED);
    this.appStatusKeys.push(this.applicationService.DISPOSITION_GOOD_STANDING);
    this.appStatusKeys.push(this.applicationService.SUSPENDED);

    // watch for URL param changes
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        // load initial and updated filters
        this._resetAllFilters(false);
      });
  }

  // full height = top of app-applist-filters.app-filters + height of div.app-filters__header
  get clientHeight(): number {
    return this.elementRef.nativeElement.offsetTop + this.elementRef.nativeElement.firstElementChild.firstElementChild.clientHeight;
  }

  public ngOnInit() {
    // load these lists just once as they don't change
    // build array of purposes only
    Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
      this.purposeKeys.push(purpose.toUpperCase());
    });
    // build array of subpurposes only
    Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
      Constants.subpurposes[purpose].forEach(subpurpose => {
        this.subpurposeKeys.push(subpurpose.toUpperCase());
      });
    });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getFilters(): FiltersType {
    // convert array-like objects to arrays
    const regions: Array<string> = [];
    Object.keys(this.regionFilters).forEach(key => { if (this.regionFilters[key]) { regions.push(key); } });

    const cpStatuses: Array<string> = [];
    Object.keys(this.cpStatusFilters).forEach(key => { if (this.cpStatusFilters[key]) { cpStatuses.push(key); } });

    const appStatuses: Array<string> = [];
    Object.keys(this.appStatusFilters).forEach(key => { if (this.appStatusFilters[key]) { appStatuses.push(key); } });

    return {
      regions: regions,
      cpStatuses: cpStatuses,
      appStatuses: appStatuses,
      applicant: this.applicantFilter && this.applicantFilter.trim() || null, // convert empty string to null
      clFile: this.clFileFilter ? this.clFileFilter.toString() : null,
      dispId: this.dispIdFilter ? this.dispIdFilter.toString() : null,
      purpose: this.purposeFilter && this.purposeFilter.trim() || null, // convert empty string to null
      subpurpose: this.subpurposeFilter && this.subpurposeFilter.trim() || null, // convert empty string to null
      publishFrom: this.publishFromFilter ? moment(this.publishFromFilter).startOf('day').toDate() : null,
      publishTo: this.publishToFilter ? moment(this.publishToFilter).endOf('day').toDate() : null
    };
  }

  //
  // The following are to "Apply" the temporary filters: copy the temporary values to the actual variables, etc.
  //
  public applyRegionFilters(doApply: boolean = true) {
    this.regionFilters = { ...this._regionFilters };
    if (doApply) { this._applyAllFilters(); }
    // this.isRegionCollapsed = true; // FUTURE
  }

  public applyCpStatusFilters(doApply: boolean = true) {
    this.cpStatusFilters = { ...this._cpStatusFilters };
    if (doApply) { this._applyAllFilters(); }
    this.isCpStatusCollapsed = true;
  }

  public applyAppStatusFilters(doApply: boolean = true) {
    this.appStatusFilters = { ...this._appStatusFilters };
    if (doApply) { this._applyAllFilters(); }
    this.isAppStatusCollapsed = true;
  }

  public applyClFileFilter(doApply: boolean = true) {
    this.clFileFilter = this._clFileFilter;
    if (doApply) { this._applyAllFilters(); }
  }

  public applyAllFilters(doApply: boolean = true) {
    this.applyRegionFilters(false);
    this.applyCpStatusFilters(false);
    this.applyAppStatusFilters(false);
    this.applicantFilter = this._applicantFilter;
    this.clFileFilter = this._clFileFilter;
    this.dispIdFilter = this._dispIdFilter;
    this.purposeFilter = this._purposeFilter;
    this.subpurposeFilter = this._subpurposeFilter;
    this.publishFromFilter = this._publishFromFilter;
    this.publishToFilter = this._publishToFilter;

    if (doApply) { this._applyAllFilters(); }
  }

  private _applyAllFilters() {
    // notify applications component
    this.updateFilters.emit(this.getFilters());

    // save new filters
    this._saveFilters();
  }

  private _saveFilters() {
    let regions: string = null;
    this.regionKeys.forEach(key => {
      if (this.regionFilters[key]) {
        if (!regions) {
          regions = key;
        } else {
          regions += ',' + key;
        }
      }
    });
    this.urlService.save('regions', regions);

    let cpStatuses: string = null;
    this.cpStatusKeys.forEach(key => {
      if (this.cpStatusFilters[key]) {
        if (!cpStatuses) {
          cpStatuses = key;
        } else {
          cpStatuses += ',' + key;
        }
      }
    });
    this.urlService.save('cpStatuses', cpStatuses);

    let appStatuses: string = null;
    this.appStatusKeys.forEach(key => {
      if (this.appStatusFilters[key]) {
        if (!appStatuses) {
          appStatuses = key;
        } else {
          appStatuses += ',' + key;
        }
      }
    });
    this.urlService.save('appStatuses', appStatuses);

    this.urlService.save('applicant', this.applicantFilter && this.applicantFilter.trim());
    this.urlService.save('clFile', this.clFileFilter && this.clFileFilter.toString());
    this.urlService.save('dispId', this.dispIdFilter && this.dispIdFilter.toString());
    this.urlService.save('purpose', this.purposeFilter && this.purposeFilter.trim());
    this.urlService.save('subpurpose', this.subpurposeFilter && this.subpurposeFilter.trim());
    this.urlService.save('publishFrom', this.publishFromFilter && moment(this.publishFromFilter).format('YYYY-MM-DD'));
    this.urlService.save('publishTo', this.publishToFilter && moment(this.publishToFilter).format('YYYY-MM-DD'));
  }

  //
  // The following are to "Cancel" the temporary filters: just reset the values.
  //
  public cancelRegionFilters() {
    this._regionFilters = { ...this.regionFilters };
    this.isRegionCollapsed = true;
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
    this.cancelRegionFilters();
    this.cancelCpStatusFilters();
    this.cancelAppStatusFilters();
    this._applicantFilter = this.applicantFilter;
    this._clFileFilter = this.clFileFilter;
    this._dispIdFilter = this.dispIdFilter;
    this._purposeFilter = this.purposeFilter;
    this._subpurposeFilter = this.subpurposeFilter;
    this._publishFromFilter = this.publishFromFilter;
    this._publishToFilter = this.publishToFilter;
  }

  // (re)sets all filters from current URL
  private _resetAllFilters(doApply: boolean) {
    // set region filters according to current param options
    const regions = (this.urlService.query('regions') || '').split(',');
    this.regionKeys.forEach(key => {
      this.regionFilters[key] = regions.includes(key);
    });

    // set cpStatus filters according to current param options
    const cpStatuses = (this.urlService.query('cpStatuses') || '').split(',');
    this.cpStatusKeys.forEach(key => {
      this.cpStatusFilters[key] = cpStatuses.includes(key);
    });

    // set appStatus filters according to current param options
    const appStatuses = (this.urlService.query('appStatuses') || '').split(',');
    this.appStatusKeys.forEach(key => {
      this.appStatusFilters[key] = appStatuses.includes(key);
    });

    this.applicantFilter = this.urlService.query('applicant');
    this.clFileFilter = this.urlService.query('clFile') ? +this.urlService.query('clFile') : null;
    this.dispIdFilter = this.urlService.query('dispId') ? +this.urlService.query('dispId') : null;
    this.purposeFilter = this.urlService.query('purpose');
    this.subpurposeFilter = this.urlService.query('subpurpose');
    this.publishFromFilter = this.urlService.query('publishFrom') ? moment(this.urlService.query('publishFrom')).toDate() : null;
    this.publishToFilter = this.urlService.query('publishTo') ? moment(this.urlService.query('publishTo')).toDate() : null;

    // copy all data from actual to temporary properties
    this._regionFilters = { ...this.regionFilters };
    this._cpStatusFilters = { ...this.cpStatusFilters };
    this._appStatusFilters = { ...this.appStatusFilters };
    this._applicantFilter = this.applicantFilter;
    this._clFileFilter = this.clFileFilter;
    this._dispIdFilter = this.dispIdFilter;
    this._purposeFilter = this.purposeFilter;
    this._subpurposeFilter = this.subpurposeFilter;
    this._publishFromFilter = this.publishFromFilter;
    this._publishToFilter = this.publishToFilter;

    // if called from UI, apply new filters
    // otherwise this was called internally (eg, init)
    if (doApply) { this._applyAllFilters(); }
  }

  //
  // The following are to "Clear" the temporary filters.
  //
  public clearRegionFilters(doApply: boolean = true) {
    this.regionKeys.forEach(key => {
      this._regionFilters[key] = false;
    });
    this.applyRegionFilters(doApply);
  }

  public clearCpStatusFilters(doApply: boolean = true) {
    this.cpStatusKeys.forEach(key => {
      this._cpStatusFilters[key] = false;
    });
    this.applyCpStatusFilters(doApply);
  }

  public clearAppStatusFilters(doApply: boolean = true) {
    this.appStatusKeys.forEach(key => {
      this._appStatusFilters[key] = false;
    });
    this.applyAppStatusFilters(doApply);
  }

  public clearAllFilters() {
    if (this.filterCount() > 0) {
      this.clearRegionFilters(false);
      this.clearCpStatusFilters(false);
      this.clearAppStatusFilters(false);
      this._applicantFilter = null;
      this._clFileFilter = null;
      this._dispIdFilter = null;
      this._purposeFilter = null;
      this._subpurposeFilter = null;
      this._publishFromFilter = null;
      this._publishToFilter = null;

      this.applyAllFilters(true);
    }
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

  public applicantFilterCount(): number {
    const applicantFilter = this.applicantFilter && this.applicantFilter.trim(); // returns null or empty
    return applicantFilter ? 1 : 0;
  }

  public clFileFilterCount(): number {
    return (this.clFileFilter && this.clFileFilter.toString().length > 0) ? 1 : 0;
  }

  public dispIdFilterCount(): number {
    return (this.dispIdFilter && this.dispIdFilter.toString().length > 0) ? 1 : 0;
  }

  public purposeFilterCount(): number {
    const purposeFilter = this.purposeFilter && this.purposeFilter.trim();  // returns null or empty
    return purposeFilter ? 1 : 0;
  }

  public subpurposeFilterCount(): number {
    const subpurposeFilter = this.subpurposeFilter && this.subpurposeFilter.trim();  // returns null or empty
    return subpurposeFilter ? 1 : 0;
  }

  public publishFilterCount(): number {
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
      + this.subpurposeFilterCount()
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

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }
}
