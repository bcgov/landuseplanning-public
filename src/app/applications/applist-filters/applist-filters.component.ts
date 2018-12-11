import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

export class ApplistFiltersComponent implements OnInit, OnDestroy {
  @Output() updateFilters = new EventEmitter(); // to applications component
  @Output() showSidePanel = new EventEmitter(); // to applications component

  public loading = true; // init
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for text boxes
  public applicantFilter: string = null;
  public _applicantFilter: string = null; // temporary filters for Cancel feature

  public clidDtidFilter: number = null;
  public _clidDtidFilter: number = null; // temporary filters for Cancel feature

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public configService: ConfigService, // used in template
    private urlService: UrlService
  ) {
    // watch for URL param changes
    // NB: this must be in constructor to get initial parameters
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        // get initial or updated parameters
        const hasChanges = this._getParameters();

        // notify applications component
        if (hasChanges) {
          // console.log('find - has changes');
          this.updateFilters.emit(this.getFilters());
        }
      });
  }

  private _getParameters(): boolean {
    this.applicantFilter = this.urlService.query('applicant');
    this.clidDtidFilter = this.urlService.query('clidDtid') ? +this.urlService.query('clidDtid') : null;

    // const hasFilters = !!this.applicantFilter || !!this.clidDtidFilter;

    const hasChanges = !_.isEqual(this._applicantFilter, this.applicantFilter)
      || !_.isEqual(this._clidDtidFilter, this.clidDtidFilter);

    // copy all data from actual to temporary properties
    this._applicantFilter = this.applicantFilter;
    this._clidDtidFilter = this.clidDtidFilter;

    return hasChanges;
  }

  public ngOnInit() { }

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

  public applyAllFilters(doNotify: boolean = true) {
    // apply all temporary filters
    this.applicantFilter = this._applicantFilter;
    this.clidDtidFilter = this._clidDtidFilter;

    // save parameters
    this._saveParameters();

    // notify applications component
    if (doNotify) { this.updateFilters.emit(this.getFilters()); }
  }

  private _saveParameters() {
    this.urlService.save('applicant', this.applicantFilter && this.applicantFilter.trim());
    this.urlService.save('clidDtid', this.clidDtidFilter && this.clidDtidFilter.toString());
  }

  // clear all temporary filters
  public clearAllFilters(doNotify: boolean = true) {
    if (this.filterCount() > 0) {
      // console.log('clearing Find filters');
      this._applicantFilter = null;
      this._clidDtidFilter = null;

      this.applyAllFilters(doNotify);
    }
  }

  // return count of filters
  public filterCount(): number {
    const applicantFilter = this.applicantFilter && this.applicantFilter.trim(); // returns null or empty
    const applicantFilterCount = applicantFilter ? 1 : 0;
    const clidDtidFilterCount = (this.clidDtidFilter && this.clidDtidFilter.toString().length > 0) ? 1 : 0;

    return applicantFilterCount + clidDtidFilterCount;
  }

  // show Explore pane
  public showExplore() {
    this.router.navigate([], { relativeTo: this.activatedRoute, fragment: 'explore', replaceUrl: true });
  }

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }
}
