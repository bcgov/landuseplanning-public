import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/concat';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/finally';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';

export interface FiltersType {
  cpStatuses: Array<string>;
  appStatuses: Array<string>;
  applicant: string;
  clidDtid: string;
  purposes: Array<string>;
  subpurposes: Array<string>;
  publishFrom: Date;
  publishTo: Date;
}

const emptyFilters: FiltersType = {
  cpStatuses: [],
  appStatuses: [],
  applicant: null,
  clidDtid: null,
  purposes: [],
  subpurposes: [],
  publishFrom: null,
  publishTo: null
};

// NB: this number needs to be small enough to give reasonable app loading feedback on slow networks
//     but large enough for optimized "added/deleted" app logic (see map component)
const PAGE_SIZE = 250;

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})

export class ApplicationsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('appmap') appmap;
  @ViewChild('applist') applist;
  @ViewChild('appfilters') appfilters;
  @ViewChild('appexplore') appexplore;
  // @ViewChild('appedetail') appdetail;

  // FUTURE: change this to an observable and components subscribe to changes ?
  // ref: https://github.com/escardin/angular2-community-faq/blob/master/services.md#how-do-i-communicate-between-components-using-a-shared-service
  // ref: https://stackoverflow.com/questions/34700438/global-events-in-angular
  private _loading = false;
  set isLoading(val: boolean) {
    this._loading = val;
    if (val) {
      this.appmap.onLoadStart();
      this.applist.onLoadStart();
      this.appfilters.onLoadStart();
      this.appexplore.onLoadStart();
    } else {
      this.appmap.onLoadEnd();
      this.applist.onLoadEnd();
      this.appfilters.onLoadEnd();
      this.appexplore.onLoadEnd();
    }
  }

  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private filters: FiltersType = null;
  private coordinates: string = null;
  public apps: Array<Application> = [];
  public totalNumber = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public currentAppId: string = null; // TODO: set this when list item is clicked

  constructor(
    public snackBar: MatSnackBar,
    private router: Router,
    private applicationService: ApplicationService,
    public configService: ConfigService, // used in template
    private renderer: Renderer2
  ) {
    // add a class to the body tag here to limit the height of the viewport when on the Applications page
    this.router.events
      .takeUntil(this.ngUnsubscribe)
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          const currentUrlSlug = event.url.slice(1);
          if (currentUrlSlug === 'applications') {
            this.renderer.addClass(document.body, 'no-scroll');
          } else {
            this.renderer.removeClass(document.body, 'no-scroll');
          }
        }
      });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');

    // prevent underlying map actions for list and filters components
    const applist_list = <HTMLElement>document.getElementById('applist-list');
    L.DomEvent.disableClickPropagation(applist_list);
    L.DomEvent.disableScrollPropagation(applist_list);

    const applist_filters = <HTMLElement>document.getElementById('applist-filters');
    L.DomEvent.disableClickPropagation(applist_filters);
    L.DomEvent.disableScrollPropagation(applist_filters);
  }

  ngAfterViewInit() {
    // get initial filters
    const findFilters = this.appfilters.getFilters();
    const exploreFilters = this.appexplore.getFilters();
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, { ...findFilters, ...exploreFilters });

    // get initial map coordinates
    this.coordinates = this.appmap.getCoordinates();

    // load initial apps
    this.getApps();
  }

  // FUTURE: allow user action to interrupt current data retrieval...
  // - create a new observable that emits any time we need updated data
  // - listen to that observable (ie, yield) and get data then -- with debounce/throttle to handle overlapping events
  // - also look at takeWhile()/takeUntil() (to complete the current query)
  // - or unsubscribe?
  private getApps(getTotalNumber: boolean = true) {
    // console.log('filters =', this.filters);

    // do this in another event so it's not in current change detection cycle
    setTimeout(() => {
      this.isLoading = true;
      let isFirstPage = true;
      this.snackBarRef = this.snackBar.open('Loading applications ...');

      if (getTotalNumber) {
        // FOR FUTURE USE
        // get total number using initial filters
        this.applicationService.getCount(this.filters, null)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(count => {
            console.log('totalNumber =', count);
            this.totalNumber = count;
          });
      }

      this.applicationService.getCount(this.filters, this.coordinates)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(count => {
          // prepare 'pages' of gets
          const observables: Array<Observable<Application[]>> = [];
          for (let page = 0; page < Math.ceil(count / PAGE_SIZE); page++) {
            observables.push(this.applicationService.getAll(page, PAGE_SIZE, this.filters, this.coordinates));
          }

          // check if there's nothing to query
          if (observables.length === 0) { this.apps = []; }

          // get all observables sequentially
          const start = (new Date()).getTime(); // for profiling
          Observable.concat(...observables)
            .takeUntil(this.ngUnsubscribe)
            .finally(() => {
              this.snackBarRef.dismiss();
              this.isLoading = false;
              console.log('got', this.apps.length, 'apps in', (new Date()).getTime() - start, 'ms');
            })
            .subscribe(applications => {
              if (isFirstPage) {
                isFirstPage = false;
                // replace array with applications so that first 'PAGE_SIZE' apps aren't necessarily redrawn on map
                // NB: OnChanges event will update the components that use this array
                this.apps = applications;
              } else {
                // NB: OnChanges event will update the components that use this array
                // NB: remove duplicates (eg, due to bad data such as multiple comment periods)
                this.apps = _.uniqBy(_.concat(this.apps, applications), app => app._id);
              }
            }, error => {
              console.log(error);
              alert('Uh-oh, couldn\'t load applications');
              // applications not found --> navigate back to home
              this.router.navigate(['/']);
            });
        }, error => {
          console.log(error);
          alert('Uh-oh, couldn\'t count applications');
          // applications not found --> navigate back to home
          this.router.navigate(['/']);
          this.snackBarRef.dismiss();
          this.isLoading = false;
        });
    });
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Event handler called when Find or Explore component updates filters.
   */
  public updateFilters(filters: FiltersType) {
    // console.log('updateFilters, filters =', filters);
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, filters);
    this.getApps();
  }

  /**
   * Event handler called when map component view has changed.
   */
  public updateCoordinates(coordinates: string) {
    // console.log('updateCoordinates, coordinates =', coordinates);
    this.coordinates = coordinates;
    this.getApps(false); // total number is not affected
  }

  /**
   * Event handler called when map component selects or unselects a marker.
   */
  public toggleCurrentApp(app: Application) {
    // this.applist.toggleCurrentApp(app); // DO NOT TOGGLE LIST ITEM AT THIS TIME
  }

  /**
   * Called when list component visibility is toggled.
   */
  public toggleAppList() {
    if (this.configService.isApplicationsListVisible) {
      this.configService.isApplicationsListVisible = false;
    } else {
      this.configService.isApplicationsListVisible = true;
      // make list visible in next timeslice
      // to visually separate panel opening from data loading
      setTimeout(() => {
        this.applist.onListVisible();
      });
    }
  }

  /**
   * Called when map component visibility is toggled.
   */
  public toggleAppMap() {
    if (this.configService.isApplicationsMapVisible) {
      this.configService.isApplicationsMapVisible = false;
    } else {
      this.configService.isApplicationsMapVisible = true;
      // make map visible in next timeslice
      // to visually separate panel opening from data loading
      setTimeout(() => {
        this.appmap.onMapVisible();
      });
    }
  }

  /**
   * Event handler called when list or map component selects or unselects an app.
   */
  public highlightApplication(app: Application, show: boolean) {
    // do something on the map:
    this.appmap.onHighlightApplication(app, show);

    // do something on the detail pane:
    if (show) {
      this.configService.isAppDetailsVisible = true;
      this.currentAppId = app._id;
    } else {
      this.configService.isAppDetailsVisible = false;
      this.currentAppId = null;
    }
  }

  // show Application Details interface
  public showDetails() {
    this._clearFilters();

    // show side panel if it's hidden or THIS component isn't already visible
    this.configService.isSidePanelVisible = !this.configService.isSidePanelVisible || !this.configService.isAppDetailsVisible;

    this.configService.isAppDetailsVisible = true;
    this.configService.isExploreAppsVisible = false;
    this.configService.isFindAppsVisible = false;
  }

  // show Explore Applications interface
  public showExplore() {
    this._clearFilters();

    // show side panel if it's hidden or THIS component isn't already visible
    this.configService.isSidePanelVisible = !this.configService.isSidePanelVisible || !this.configService.isExploreAppsVisible;

    this.configService.isAppDetailsVisible = false;
    this.configService.isExploreAppsVisible = true;
    this.configService.isFindAppsVisible = false;
  }

  // show Find Applications interface
  public showFind() {
    this._clearFilters();

    // show side panel if it's hidden or THIS component isn't already visible
    this.configService.isSidePanelVisible = !this.configService.isSidePanelVisible || !this.configService.isFindAppsVisible;

    this.configService.isAppDetailsVisible = false;
    this.configService.isExploreAppsVisible = false;
    this.configService.isFindAppsVisible = true;
  }

  private _clearFilters() {
    // if we're hiding the explore component, clear its filters
    if (this.configService.isExploreAppsVisible) { this.appexplore.clearAllFilters(); }
    // if we're hiding the find component, clear its filters
    if (this.configService.isFindAppsVisible) { this.appfilters.clearAllFilters(); }
  }

}
