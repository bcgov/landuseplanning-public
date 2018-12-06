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

export interface ExploreFiltersType {
  cpStatuses: Array<string>;
  appStatuses: Array<string>;
  applicant: string;
  clidDtid: string;
  purpose: string;
  subpurpose: string;
  publishFrom: Date;
  publishTo: Date;
}

@Component({
  selector: 'app-explore',
  templateUrl: './app-explore.component.html',
  styleUrls: ['./app-explore.component.scss']
})
export class AppExploreComponent implements OnInit, OnDestroy {
  @Output() updateFilters = new EventEmitter(); // to applications component

  readonly minDate = moment('2018-03-23').toDate(); // first app created
  readonly maxDate = moment().toDate(); // today

  public loading = true; // init
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for drop-down menus
  public cpStatusKeys: Array<string> = [];
  public appStatusKeys: Array<string> = [];

  // search keys purpose and subpurpose
  public purposeKeys: Array<string> = [];
  public subpurposeKeys: Array<string> = [];

  public cpStatusFilters: object = {}; // array-like object
  public _cpStatusFilters: object = {}; // temporary filters for Cancel feature

  public appStatusFilters: object = {}; // array-like object
  public _appStatusFilters: object = {}; // temporary filters for Cancel feature

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
  public purposeSearch = (text$: Observable<string>) => text$
    .debounceTime(200)
    .distinctUntilChanged()
    .map(term => term.length < 1 ? []
      : this.purposeKeys.filter(key => key.indexOf(this._purposeFilter.toUpperCase()) > -1) // .slice(0, 10)
    );

  public subpurposeSearch = (text$: Observable<string>) => text$
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

    // comment period status
    this.cpStatusKeys.push(this.commentPeriodService.OPEN);
    this.cpStatusKeys.push(this.commentPeriodService.NOT_OPEN);

    // application status keys
    this.appStatusKeys.push(this.applicationService.APPLICATION_UNDER_REVIEW);
    this.appStatusKeys.push(this.applicationService.APPLICATION_REVIEW_COMPLETE);
    this.appStatusKeys.push(this.applicationService.DECISION_APPROVED);
    this.appStatusKeys.push(this.applicationService.DECISION_NOT_APPROVED);
    this.appStatusKeys.push(this.applicationService.ABANDONED);

    Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
      this.purposeKeys.push(purpose.toUpperCase());
    });

    Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
      Constants.subpurposes[purpose].forEach(subpurpose => {
        this.subpurposeKeys.push(subpurpose.toUpperCase());
      });
    });

    // watch for URL param changes
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        // load initial and updated filters
        // this._resetAllFilters(false);
      });
  }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getFilters(): ExploreFiltersType {
    // convert array-like objects to arrays
    const cpStatuses: Array<string> = [];
    Object.keys(this.cpStatusFilters).forEach(key => { if (this.cpStatusFilters[key]) { cpStatuses.push(key); } });

    const appStatuses: Array<string> = [];
    Object.keys(this.appStatusFilters).forEach(key => { if (this.appStatusFilters[key]) { appStatuses.push(key); } });

    return {
      cpStatuses: cpStatuses,
      appStatuses: appStatuses,
      applicant: null,
      clidDtid: null,
      purpose: this.purposeFilter && this.purposeFilter.trim() || null, // convert empty string to null
      subpurpose: this.subpurposeFilter && this.subpurposeFilter.trim() || null, // convert empty string to null
      publishFrom: this.publishFromFilter ? moment(this.publishFromFilter).startOf('day').toDate() : null,
      publishTo: this.publishToFilter ? moment(this.publishToFilter).endOf('day').toDate() : null
    };
  }

  public applyCpStatusFilters(doApply: boolean = true) {
    this.cpStatusFilters = { ...this._cpStatusFilters };
    if (doApply) { this._applyAllFilters(); }
  }

  public applyAppStatusFilters(doApply: boolean = true) {
    this.appStatusFilters = { ...this._appStatusFilters };
    if (doApply) { this._applyAllFilters(); }
  }

  public applyAllFilters(doApply: boolean = true) {
    this.applyCpStatusFilters(false);
    this.applyAppStatusFilters(false);
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

  /// persist selected filters
  private _saveFilters() {
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
    this.urlService.save('purpose', this.purposeFilter && this.purposeFilter.trim());
    this.urlService.save('subpurpose', this.subpurposeFilter && this.subpurposeFilter.trim());
    this.urlService.save('publishFrom', this.publishFromFilter && moment(this.publishFromFilter).format('YYYY-MM-DD'));
    this.urlService.save('publishTo', this.publishToFilter && moment(this.publishToFilter).format('YYYY-MM-DD'));
  }

  public cancelCpStatusFilters() {
    this._cpStatusFilters = { ...this.cpStatusFilters };
  }

  public cancelAppStatusFilters() {
    this._appStatusFilters = { ...this.appStatusFilters };
  }

  // The following are to "Cancel" the temporary filters: just reset the values.
  public cancelAllFilters() {
    this.cancelCpStatusFilters();
    this.cancelAppStatusFilters();
    this._purposeFilter = this.purposeFilter;
    this._subpurposeFilter = this.subpurposeFilter;
    this._publishFromFilter = this.publishFromFilter;
    this._publishToFilter = this.publishToFilter;
  }

  // (re)sets all filters from current URL
  private _resetAllFilters(doApply: boolean) {
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

    this.purposeFilter = this.urlService.query('purpose');
    this.subpurposeFilter = this.urlService.query('subpurpose');
    this.publishFromFilter = this.urlService.query('publishFrom') ? moment(this.urlService.query('publishFrom')).toDate() : null;
    this.publishToFilter = this.urlService.query('publishTo') ? moment(this.urlService.query('publishTo')).toDate() : null;

    // copy all data from actual to temporary properties
    this._cpStatusFilters = { ...this.cpStatusFilters };
    this._appStatusFilters = { ...this.appStatusFilters };
    this._purposeFilter = this.purposeFilter;
    this._subpurposeFilter = this.subpurposeFilter;
    this._publishFromFilter = this.publishFromFilter;
    this._publishToFilter = this.publishToFilter;

    // if called from UI, apply new filters
    // otherwise this was called internally (eg, init)
    if (doApply) { this._applyAllFilters(); }
  }

  // The following are to "Clear" the temporary filters.
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
      this.clearCpStatusFilters(false);
      this.clearAppStatusFilters(false);
      this._purposeFilter = null;
      this._subpurposeFilter = null;
      this._publishFromFilter = null;
      this._publishToFilter = null;

      this.applyAllFilters(true);
    }
  }

  public cpStatusCount(): number {
    return this.cpStatusKeys.filter(key => this.cpStatusFilters[key]).length;
  }

  public appStatusCount(): number {
    return this.appStatusKeys.filter(key => this.appStatusFilters[key]).length;
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
    return this.cpStatusCount()
      + this.appStatusCount()
      + this.purposeFilterCount()
      + this.subpurposeFilterCount()
      + this.publishFilterCount();
  }

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }
}
