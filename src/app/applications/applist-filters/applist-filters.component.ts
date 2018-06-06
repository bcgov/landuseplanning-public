import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Constants } from 'app/utils/constants';
import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
    selector: 'app-applist-filters',
    templateUrl: './applist-filters.component.html',
    styleUrls: ['./applist-filters.component.scss']
})
export class ApplistFiltersComponent implements OnInit, OnChanges, OnDestroy {
    // NB: this component is bound to the same list of apps as the other components
    @Input() allApps: Array<Application> = []; // from map component
    @Output() updateMatching = new EventEmitter(); // to map component

    public isFiltersCollapsed = true;
    public isCpStatusCollapsed = true;
    public isAppStatusCollapsed = true;
    public gotChanges = false;
    private paramMap: ParamMap = null;
    private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

    // search keys for drop-down menus
    public cpStatusKeys: Array<string> = [];
    public appStatusKeys: Array<string> = [];

    // search keys for text boxes
    private applicantKeys: Array<string> = [];
    private clFileKeys: Array<number> = [];
    private dispIdKeys: Array<number> = [];
    private purposeKeys: Array<string> = [];

    public cpStatusFilters: Object = {}; // array-like object
    public _cpStatusFilters: Object = {}; // for Cancel feature

    public appStatusFilters: Object = {}; // array-like object
    public _appStatusFilters: Object = {}; // for Cancel feature

    public applicantFilter: string = null;
    public _applicantFilter: string = null; // for Cancel feature

    public clFileFilter: number = null;
    public _clFileFilter: number = null; // for Cancel feature

    public dispIdFilter: number = null;
    public _dispIdFilter: number = null; // for Cancel feature

    public purposeFilter: string = null;
    public _purposeFilter: string = null; // for Cancel feature

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

    public clFileSearch = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => term.length < 1 ? []
                : this.clFileKeys.filter(key => key.toString().indexOf(this._clFileFilter.toString()) > -1) // .slice(0, 10)
            );

    public dispIdSearch = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => term.length < 1 ? []
                : this.dispIdKeys.filter(key => key.toString().indexOf(this._dispIdFilter.toString()) > -1) // .slice(0, 10)
            );

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

    public ngOnInit() {
        // prevent underlying map actions for these events
        const element = <HTMLElement>document.getElementById('applist-filters');
        L.DomEvent.disableClickPropagation(element); // includes double-click
        L.DomEvent.disableScrollPropagation(element);

        // get optional query parameters
        this.route.queryParamMap
            .takeUntil(this.ngUnsubscribe)
            .subscribe(paramMap => {
                this.paramMap = paramMap;

                // set filters according to paramMap (which may change on routing)
                this.internalResetAllFilters(false);

                // apply filters (once we have initial app list)
                if (this.gotChanges) {
                    this.internalApplyAllFilters(false);
                }
            });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (!changes.allApps.firstChange && changes.allApps.currentValue) {
            this.gotChanges = true;

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

            // apply filtering
            this.internalApplyAllFilters(false);
        }
    }

    public ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    //
    // The following are to "Apply" the temporary filters: copy the temporary values to the actual variables, etc.
    //
    public applyCpStatusFilters() {
        this.cpStatusFilters = { ...this._cpStatusFilters };
        this.internalApplyAllFilters(true);
    }

    public applyAppStatusFilters() {
        this.appStatusFilters = { ...this._appStatusFilters };
        this.internalApplyAllFilters(true);
    }

    public applyClFileFilter() {
        this.clFileFilter = this._clFileFilter;
        this.internalApplyAllFilters(true);
    }

    public applyAllFilters() {
        this.cpStatusFilters = { ...this._cpStatusFilters };
        this.appStatusFilters = { ...this._appStatusFilters };
        this.applicantFilter = this._applicantFilter;
        this.clFileFilter = this._clFileFilter;
        this.dispIdFilter = this._dispIdFilter;
        this.purposeFilter = this._purposeFilter;

        this.internalApplyAllFilters(true);
    }

    private internalApplyAllFilters(doSave: boolean) {
        this.allApps.forEach(app => app.isMatches = this.showThisApp(app));

        // notify map component
        this.updateMatching.emit(this.allApps);

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
        const allCpStatus = this.cpStatusKeys.every(key => {
            return (this.cpStatusFilters[key] === false);
        });

        // check for matching Comment Period Status
        retVal = retVal && (
            allCpStatus ||
            (this.cpStatusFilters[this.commentPeriodService.OPEN] && this.commentPeriodService.isOpen(item.currentPeriod)) ||
            (this.cpStatusFilters[this.commentPeriodService.NOT_STARTED] && this.commentPeriodService.isNotStarted(item.currentPeriod)) ||
            (this.cpStatusFilters[this.commentPeriodService.CLOSED] && this.commentPeriodService.isClosed(item.currentPeriod)) ||
            (this.cpStatusFilters[this.commentPeriodService.NOT_OPEN] && this.commentPeriodService.isNotOpen(item.currentPeriod))
        );

        // if no option is selected, match all
        const allAppStatus = this.appStatusKeys.every(key => {
            return (this.appStatusFilters[key] === false);
        });

        // check for matching Application Status
        retVal = retVal && (
            allAppStatus ||
            (this.appStatusFilters[this.applicationService.ACCEPTED] && this.applicationService.isAccepted(item.status)) ||
            (this.appStatusFilters[this.applicationService.DECISION_MADE] && this.applicationService.isDecision(item.status) && !this.applicationService.isCancelled(item.status)) ||
            (this.appStatusFilters[this.applicationService.CANCELLED] && this.applicationService.isCancelled(item.status)) ||
            (this.appStatusFilters[this.applicationService.ABANDONED] && this.applicationService.isAbandoned(item.status)) ||
            (this.appStatusFilters[this.applicationService.DISPOSITION_GOOD_STANDING] && this.applicationService.isDispGoodStanding(item.status)) ||
            (this.appStatusFilters[this.applicationService.SUSPENDED] && this.applicationService.isSuspended(item.status))
        );

        // check for matching Applicant
        retVal = retVal && (
            !this.applicantFilter || !item.client ||
            item.client.toUpperCase().indexOf(this.applicantFilter.toUpperCase()) > -1
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

        // check for matching Purpose or Sub-purpose
        retVal = retVal && (
            !this.purposeFilter || !item.purpose || !item.subpurpose ||
            item.purpose.toUpperCase().indexOf(this.purposeFilter.toUpperCase()) > -1 ||
            item.subpurpose.toUpperCase().indexOf(this.purposeFilter.toUpperCase()) > -1
        );

        return retVal;
    }

    private saveFilters() {
        const params: Params = {}; // array-like object

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

    //
    // The following are to "Cancel" the temporary filters: just reset the values.
    //
    public cancelCpStatusFilters() {
        this._cpStatusFilters = { ...this.cpStatusFilters };
    }

    public cancelAppStatusFilters() {
        this._appStatusFilters = { ...this.appStatusFilters };
    }

    public cancelAllFilters(e: Event) {
        this._cpStatusFilters = { ...this.cpStatusFilters };
        this._appStatusFilters = { ...this.appStatusFilters };
        this._applicantFilter = this.applicantFilter;
        this._clFileFilter = this.clFileFilter;
        this._dispIdFilter = this.dispIdFilter;
        this._purposeFilter = this.purposeFilter;
    }

    public resetAllFilters() {
        this.internalResetAllFilters(true);
    }

    // (re)sets all filters from current param map
    private internalResetAllFilters(doApply: boolean) {
        if (this.paramMap) {
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

            // copy all data from actual to temporary properties
            this._cpStatusFilters = { ...this.cpStatusFilters };
            this._appStatusFilters = { ...this.appStatusFilters };
            this._applicantFilter = this.applicantFilter;
            this._clFileFilter = this.clFileFilter;
            this._dispIdFilter = this.dispIdFilter;
            this._purposeFilter = this.purposeFilter;
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
    public clearCpStatusFilters() {
        this.cpStatusKeys.forEach(key => {
            this._cpStatusFilters[key] = false;
        });
    }

    public clearAppStatusFilters() {
        this.appStatusKeys.forEach(key => {
            this._appStatusFilters[key] = false;
        });
    }

    public clearAllFilters(doApply: boolean) {
        this.clearCpStatusFilters();
        this.clearAppStatusFilters();
        this._applicantFilter = null;
        this._clFileFilter = null;
        this._dispIdFilter = null;
        this._purposeFilter = null;

        if (doApply) {
            this.applyAllFilters();
        }
    }

    public cpStatusCount(): number {
        return this.cpStatusKeys.filter(key => this.cpStatusFilters[key]).length;
    }

    public appStatusCount(): number {
        return this.appStatusKeys.filter(key => this.appStatusFilters[key]).length;
    }

    private applicantFilterCount(): number {
        return (this.applicantFilter && this.applicantFilter.length > 0) ? 1 : 0;
    }

    private clFileFilterCount(): number {
        return (this.clFileFilter && this.clFileFilter.toString().length > 0) ? 1 : 0;
    }

    private dispIdFilterCount(): number {
        return (this.dispIdFilter && this.dispIdFilter.toString().length > 0) ? 1 : 0;
    }

    private purposeFilterCount(): number {
        return (this.purposeFilter && this.purposeFilter.length > 0) ? 1 : 0;
    }

    public filterCount(): number {
        return this.cpStatusCount()
            + this.appStatusCount()
            + this.applicantFilterCount()
            + this.clFileFilterCount()
            + this.dispIdFilterCount()
            + this.purposeFilterCount();
    }

    public matchesVisibleCount(apps: Application[]): number {
        return apps.filter(a => a.isMatches && a.isVisible).length;
    }

    public cpStatusHasChanges(): boolean {
        return !_.isEqual(this._cpStatusFilters, this.cpStatusFilters);
    }

    public appStatusHasChanges(): boolean {
        return !_.isEqual(this._appStatusFilters, this.appStatusFilters);
    }
}
