import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { UrlService } from 'app/services/url.service';

@Component({
  selector: 'app-find-panel',
  templateUrl: './find-panel.component.html',
  styleUrls: ['./find-panel.component.scss']
})

export class FindPanelComponent implements OnInit, OnDestroy {

  @Output() updateFilters = new EventEmitter(); // to applications component
  @Output() hideSidePanel = new EventEmitter(); // to applications component // used in template
  @Output() resetView = new EventEmitter(); // to applications component

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // search keys for text boxes
  public applicantFilter: string = null;
  public _applicantFilter: string = null; // temporary filters for Cancel feature

  public clidDtidFilter: number = null;
  public _clidDtidFilter: number = null; // temporary filters for Cancel feature

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private urlService: UrlService
  ) {
    // watch for URL param changes
    // NB: this must be in constructor to get initial parameters
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        // get initial or updated parameters
        // TODO: could also get params from event.url
        const hasChanges = this.getParameters();

        // notify applications component that we have new filters
        if (hasChanges) {
          this.updateFilters.emit(this.getFilters());
        }
      });
  }

  private getParameters(): boolean {
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
    // notify applications component to reset map view so user has context of what results are returned
    this.resetView.emit();

    // apply all temporary filters
    this.applicantFilter = this._applicantFilter;
    this.clidDtidFilter = this._clidDtidFilter;

    // save parameters
    this._saveParameters();

    // notify applications component that we have new filters
    if (doNotify) { this.updateFilters.emit(this.getFilters()); }
  }

  private _saveParameters() {
    this.urlService.save('applicant', this.applicantFilter && this.applicantFilter.trim());
    this.urlService.save('clidDtid', this.clidDtidFilter && this.clidDtidFilter.toString());
  }

  // clear all temporary filters
  public clearAllFilters(doNotify: boolean = true) {
    if (this.filterCount() > 0) {
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

  // show Explore panel
  public showExplore() {
    // hard-navigate to remove any other URL parameters
    this.router.navigate([], { relativeTo: this.activatedRoute, fragment: 'explore' });
  }

}
