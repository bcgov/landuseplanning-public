import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';
// import { FiltersType } from 'app/applications/applist-filters/applist-filters.component'; // FUTURE

// NB: page size is calculated to optimize Waiting vs Download time
// all 1414 at once => ~4.5 seconds
// 15 pages of 100 => ~25 seconds
// 6 pages of 250 => ~9 seconds
// 3 pages of 500 => ~3.5 seconds
const PAGE_SIZE = 500;

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})

export class ApplicationsComponent implements OnInit, OnDestroy {
  @ViewChild('appmap') appmap;
  @ViewChild('applist') applist;
  @ViewChild('appfilters') appfilters;

  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  public allApps: Array<Application> = [];
  // private filters: FiltersType = null; // FUTURE
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public snackBar: MatSnackBar,
    private router: Router,
    private applicationService: ApplicationService,
    public configService: ConfigService // used in template
  ) { }

  ngOnInit() {
    // prevent underlying map actions for list and filters components
    const applist_list = <HTMLElement>document.getElementById('applist-list');
    L.DomEvent.disableClickPropagation(applist_list);
    L.DomEvent.disableScrollPropagation(applist_list);

    const applist_filters = <HTMLElement>document.getElementById('applist-filters');
    L.DomEvent.disableClickPropagation(applist_filters);
    L.DomEvent.disableScrollPropagation(applist_filters);

    // get initial filters
    // this.filters = { ...this.appfilters.getFilters() }; // FUTURE

    // load initial apps
    this.getApps();
  }

  private getApps() {
    // do this in another event (so it's not in current change detection cycle)
    setTimeout(() => {
      this.snackBarRef = this.snackBar.open('Loading applications ...');
      this.allApps = []; // empty the list
      this._getPageOfApps(0, PAGE_SIZE);
    }, 0);
  }

  // NB: recursive function
  // TODO: move this to application.service which would return pages of observables
  private _getPageOfApps(pageNum: number, pageSize: number) {
    // FUTURE: for filtering in API
    // this.applicationService.getAllFull(pageNum, pageSize, this.filters.regionFilters, this.filters.cpStatusFilters, this.filters.appStatusFilters,
    //   this.filters.applicantFilter, this.filters.clFileFilter, this.filters.dispIdFilter, this.filters.purposeFilter)
    this.applicationService.getAllFull(pageNum, pageSize)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(applications => {
        this.allApps = _.concat(this.allApps, applications);
        // is this last page?
        if (applications.length < PAGE_SIZE) {
          this.snackBarRef.dismiss();
        } else {
          this._getPageOfApps(++pageNum, PAGE_SIZE);
        }
      }, error => {
        this.snackBarRef.dismiss();
        console.log(error);
        alert('Uh-oh, couldn\'t load applications');
        // applications not found --> navigate back to home
        this.router.navigate(['/']);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Event handler called when filters component updates list of matching apps.
   */
  public onUpdateMatching(apps: Application[]) {
    this.appmap.onUpdateMatching(apps);

    // this.filters = { ...filters }; // FUTURE
    // this.getApps(); // FUTURE
  }

  /**
   * Event handler called when list component selects or unselects an app.
   */
  public highlightApplication(app: Application, show: boolean) { this.appmap.highlightApplication(app, show); }

  /**
   * Event handler called when Update Results checkbox has changed.
   */
  public onUpdateResultsChange() { this.appmap.setVisibleDebounced(); }

  /**
   * Called when list component visibility is toggled.
   */
  public toggleAppList() { this.appmap.toggleAppList(); }
}
