import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import * as moment from 'moment';

import { Constants } from 'app/utils/constants';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';
import { UrlService } from 'app/services/url.service';

@Component({
  selector: 'app-explore',
  templateUrl: './app-explore.component.html',
  styleUrls: ['./app-explore.component.scss']
})
export class AppExploreComponent implements OnDestroy {
  @Output() updateFilters = new EventEmitter(); // to applications component

  readonly minDate = moment('2018-03-23').toDate(); // first app created
  readonly maxDate = moment().toDate(); // today

  public loading = true; // init
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for lists
  public cpStatusKeys: Array<string> = [];
  public appStatusKeys: Array<string> = [];
  public purposeKeys: Array<string> = [];
  public subpurposeKeys: Array<string> = [];

  public cpStatusFilters: object = {}; // array-like object
  public _cpStatusFilters: object = {}; // temporary filters for Cancel feature

  public appStatusFilters: object = {}; // array-like object
  public _appStatusFilters: object = {}; // temporary filters for Cancel feature

  public purposeFilters: object = {}; // array-like object
  public _purposeFilters: object = {}; // temporary filters for Cancel feature

  public subpurposeFilters: object = {}; // array-like object
  public _subpurposeFilters: object = {}; // temporary filters for Cancel feature

  public publishFromFilter: Date = null;
  public _publishFromFilter: Date = null; // temporary filters for Cancel feature

  public publishToFilter: Date = null;
  public _publishToFilter: Date = null; // temporary filters for Cancel feature

  constructor(
    private applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService, // also used in template
    public configService: ConfigService, // used in template
    private urlService: UrlService
  ) {
    // declare comment period status keys
    this.cpStatusKeys.push(this.commentPeriodService.OPEN);
    this.cpStatusKeys.push(this.commentPeriodService.NOT_OPEN);

    // declare application status keys
    this.appStatusKeys.push(this.applicationService.APPLICATION_UNDER_REVIEW);
    this.appStatusKeys.push(this.applicationService.APPLICATION_REVIEW_COMPLETE);
    this.appStatusKeys.push(this.applicationService.DECISION_APPROVED);
    this.appStatusKeys.push(this.applicationService.DECISION_NOT_APPROVED);
    this.appStatusKeys.push(this.applicationService.ABANDONED);

    // declare purpose keys
    Object.getOwnPropertyNames(Constants.subpurposes).forEach(purpose => {
      this.purposeKeys.push(purpose.toUpperCase());
    });

    // declare subpurpose keys
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
        this._resetAllFilters(false);
      });
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public getFilters(): object {
    // convert array-like objects to arrays
    const cpStatuses: Array<string> = [];
    Object.keys(this.cpStatusFilters).forEach(key => { if (this.cpStatusFilters[key]) { cpStatuses.push(key); } });

    const appStatuses: Array<string> = [];
    Object.keys(this.appStatusFilters).forEach(key => { if (this.appStatusFilters[key]) { appStatuses.push(key); } });

    const purposes: Array<string> = [];
    Object.keys(this.purposeFilters).forEach(key => { if (this.purposeFilters[key]) { purposes.push(key); } });

    const subpurposes: Array<string> = [];
    Object.keys(this.subpurposeFilters).forEach(key => { if (this.subpurposeFilters[key]) { subpurposes.push(key); } });

    return {
      cpStatuses: cpStatuses,
      appStatuses: appStatuses,
      purposes: purposes,
      subpurposes: subpurposes,
      publishFrom: this.publishFromFilter ? moment(this.publishFromFilter).startOf('day').toDate() : null,
      publishTo: this.publishToFilter ? moment(this.publishToFilter).endOf('day').toDate() : null
    };
  }

  // apply all temporary filters
  public applyAllFilters(doApply: boolean = true) {
    this.cpStatusFilters = { ...this._cpStatusFilters };
    this.appStatusFilters = { ...this._appStatusFilters };
    this.purposeFilters = { ...this._purposeFilters };
    this.subpurposeFilters = { ...this._subpurposeFilters };
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

  // persist selected filters
  private _saveFilters() {
    let cpStatuses: string = null;
    this.cpStatusKeys.forEach(key => {
      if (this.cpStatusFilters[key]) {
        if (!cpStatuses) {
          cpStatuses = key;
        } else {
          cpStatuses += '|' + key;
        }
      }
    });

    let appStatuses: string = null;
    this.appStatusKeys.forEach(key => {
      if (this.appStatusFilters[key]) {
        if (!appStatuses) {
          appStatuses = key;
        } else {
          appStatuses += '|' + key;
        }
      }
    });

    let purposes: string = null;
    this.purposeKeys.forEach(key => {
      if (this.purposeFilters[key]) {
        if (!purposes) {
          purposes = key;
        } else {
          purposes += '|' + key;
        }
      }
    });

    let subpurposes: string = null;
    this.subpurposeKeys.forEach(key => {
      if (this.subpurposeFilters[key]) {
        if (!subpurposes) {
          subpurposes = key;
        } else {
          subpurposes += '|' + key;
        }
      }
    });

    this.urlService.save('cpStatuses', cpStatuses);
    this.urlService.save('appStatuses', appStatuses);
    this.urlService.save('purposes', purposes);
    this.urlService.save('subpurposes', subpurposes);
    this.urlService.save('publishFrom', this.publishFromFilter && moment(this.publishFromFilter).format('YYYY-MM-DD'));
    this.urlService.save('publishTo', this.publishToFilter && moment(this.publishToFilter).format('YYYY-MM-DD'));
  }

  // NOT USED AT THIS TIME
  // // cancel the temporary filters -- just reset the values
  // public cancelAllFilters() {
  //   this._cpStatusFilters = { ...this.cpStatusFilters };
  //   this._appStatusFilters = { ...this.appStatusFilters };
  //   this._purposeFilters = this.purposeFilters;
  //   this._subpurposeFilters = this.subpurposeFilters;
  //   this._publishFromFilter = this.publishFromFilter;
  //   this._publishToFilter = this.publishToFilter;
  // }

  // (re)set all filters from current URL params
  private _resetAllFilters(doApply: boolean) {
    const cpStatuses = (this.urlService.query('cpStatuses') || '').split('|');
    this.cpStatusKeys.forEach(key => {
      this.cpStatusFilters[key] = cpStatuses.includes(key);
    });

    const appStatuses = (this.urlService.query('appStatuses') || '').split('|');
    this.appStatusKeys.forEach(key => {
      this.appStatusFilters[key] = appStatuses.includes(key);
    });

    const purposes = (this.urlService.query('purposes') || '').split('|');
    this.purposeKeys.forEach(key => {
      this.purposeFilters[key] = purposes.includes(key);
    });

    const subpurposes = (this.urlService.query('subpurposes') || '').split('|');
    this.subpurposeKeys.forEach(key => {
      this.subpurposeFilters[key] = subpurposes.includes(key);
    });

    this.publishFromFilter = this.urlService.query('publishFrom') ? moment(this.urlService.query('publishFrom')).toDate() : null;
    this.publishToFilter = this.urlService.query('publishTo') ? moment(this.urlService.query('publishTo')).toDate() : null;

    // copy all data from actual to temporary properties
    this._cpStatusFilters = { ...this.cpStatusFilters };
    this._appStatusFilters = { ...this.appStatusFilters };
    this._purposeFilters = { ...this.purposeFilters };
    this._subpurposeFilters = { ...this.subpurposeFilters };
    this._publishFromFilter = this.publishFromFilter;
    this._publishToFilter = this.publishToFilter;

    // if called from UI, apply new filters
    // otherwise this was called internally (eg, init)
    if (doApply) { this._applyAllFilters(); }
  }

  // clear all temporary filters
  public clearAllFilters() {
    if (this.filterCount() > 0) {
      this.cpStatusKeys.forEach(key => { this._cpStatusFilters[key] = false; });
      this.appStatusKeys.forEach(key => { this._appStatusFilters[key] = false; });
      this.purposeKeys.forEach(key => { this._purposeFilters[key] = false; });
      this.subpurposeKeys.forEach(key => { this._subpurposeFilters[key] = false; });
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

  public purposeFiltersCount(): number {
    return this.purposeKeys.filter(key => this.purposeFilters[key]).length;
  }

  public subpurposeFiltersCount(): number {
    return this.subpurposeKeys.filter(key => this.subpurposeFilters[key]).length;
  }

  public publishFilterCount(): number {
    return (this.publishFromFilter || this.publishToFilter) ? 1 : 0;
  }

  public filterCount(): number {
    return this.cpStatusCount()
      + this.appStatusCount()
      + this.purposeFiltersCount()
      + this.subpurposeFiltersCount()
      + this.publishFilterCount();
  }

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }
}
