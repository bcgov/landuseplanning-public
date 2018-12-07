import { Component, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { ConfigService } from 'app/services/config.service';
import { UrlService } from 'app/services/url.service';

@Component({
  selector: 'app-applist-filters',
  templateUrl: './applist-filters.component.html',
  styleUrls: ['./applist-filters.component.scss']
})

export class ApplistFiltersComponent implements OnDestroy {
  @Output() updateFilters = new EventEmitter(); // to applications component

  public loading = true; // init
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for text boxes
  public applicantFilter: string = null;
  public _applicantFilter: string = null; // temporary filters for Cancel feature

  public clidDtidFilter: number = null;
  public _clidDtidFilter: number = null; // temporary filters for Cancel feature

  constructor(
    public configService: ConfigService, // used in template
    private urlService: UrlService
  ) {
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
    return {
      applicant: this.applicantFilter && this.applicantFilter.trim() || null, // convert empty string to null
      clidDtid: this.clidDtidFilter ? this.clidDtidFilter.toString() : null
    };
  }

  // apply all temporary filters
  public applyAllFilters() {
    this.applicantFilter = this._applicantFilter;
    this.clidDtidFilter = this._clidDtidFilter;

    this._applyAllFilters();
  }

  private _applyAllFilters() {
    // notify applications component
    this.updateFilters.emit(this.getFilters());

    // save new filters
    this._saveFilters();
  }

  // persist selected filters
  private _saveFilters() {
    this.urlService.save('applicant', this.applicantFilter && this.applicantFilter.trim());
    this.urlService.save('clidDtid', this.clidDtidFilter && this.clidDtidFilter.toString());
  }

  // NOT USED AT THIS TIME
  // // cancel the temporary filters -- just reset the values
  // public cancelAllFilters() {
  //   this._applicantFilter = this.applicantFilter;
  //   this._clidDtidFilter = this.clidDtidFilter;
  // }

  // (re)sets all filters from current URL params
  private _resetAllFilters(doApply: boolean) {
    this.applicantFilter = this.urlService.query('applicant');
    this.clidDtidFilter = this.urlService.query('clidDtid') ? +this.urlService.query('clidDtid') : null;

    // copy all data from actual to temporary properties
    this._applicantFilter = this.applicantFilter;
    this._clidDtidFilter = this.clidDtidFilter;

    // if called from UI, apply new filters
    // otherwise this was called internally (eg, init)
    if (doApply) { this._applyAllFilters(); }
  }

  //
  // The following are to "Clear" the temporary filters.
  //
  public clearAllFilters() {
    if (this.filterCount() > 0) {
      this._applicantFilter = null;
      this._clidDtidFilter = null;

      this.applyAllFilters();
    }
  }

  public applicantFilterCount(): number {
    const applicantFilter = this.applicantFilter && this.applicantFilter.trim(); // returns null or empty
    return applicantFilter ? 1 : 0;
  }

  public clidDtidFilterCount(): number {
    return (this.clidDtidFilter && this.clidDtidFilter.toString().length > 0) ? 1 : 0;
  }

  public filterCount(): number {
    return this.applicantFilterCount() + this.clidDtidFilterCount();
  }

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }
}
