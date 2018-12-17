import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/concat';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/finally';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { ApplistMapComponent } from './applist-map/applist-map.component';
import { ApplistListComponent } from './applist-list/applist-list.component';
import { ApplistFiltersComponent } from './applist-filters/applist-filters.component';
import { AppExploreComponent } from './app-explore/app-explore.component';
import { AppDetailsComponent } from './app-details/app-details.component';
import { SplashModalComponent } from './splash-modal/splash-modal.component';
import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';
import { UrlService } from 'app/services/url.service';

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

  @ViewChild('appmap') appmap: ApplistMapComponent;
  @ViewChild('applist') applist: ApplistListComponent;
  @ViewChild('appfilters') appfilters: ApplistFiltersComponent;
  @ViewChild('appexplore') appexplore: AppExploreComponent;
  @ViewChild('appdetail') appdetail: AppDetailsComponent;

  // prevent the snackbar from showing if we load faster than 250ms
  // tslint:disable-next-line:member-ordering
  private showSnackBar = _.debounce(() => {
    this.snackBarRef = this.snackBar.open('Loading applications ...');
  }, 250);

  public isApplicationsListVisible = false;
  public isExploreAppsVisible = false;
  public isFindAppsVisible = false;
  public isApplicationsMapVisible = true;
  public isSidePanelVisible = false;
  public isAppDetailsVisible = false;

  public isLoading = false; // initial value
  private ngbModal: NgbModalRef = null;
  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private filters: FiltersType = null;
  private coordinates: string = null;
  public apps: Array<Application> = [];
  public totalNumber = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public snackBar: MatSnackBar,
    private modalService: NgbModal,
    private router: Router,
    private applicationService: ApplicationService,
    public configService: ConfigService, // used in template
    public urlService: UrlService,
    private renderer: Renderer2 // also used in template
  ) {
    // watch for URL param changes
    // NB: this must be in constructor to get initial filters
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(event => {
        // when we have an URL fragment, show respective pane
        const urlTree = router.parseUrl(event.url);
        if (urlTree && urlTree.fragment) {
          // console.log('got fragment =', urlTree.fragment);
          // only show panels if splash modal is not displayed
          if (!this.configService.showSplashModal) {
            switch (urlTree.fragment) {
              case 'details': if (!this.isAppDetailsVisible) { this.toggleDetails(true); } break;
              case 'explore': if (!this.isExploreAppsVisible) { this.toggleExplore(true); } break;
              case 'find': if (!this.isFindAppsVisible) { this.toggleFind(true); } break;
            }
          }
        }
      });
  }

  // cancel showing the snackbar if we load the applications quickly
  private hideSnackBar() {
    this.showSnackBar.cancel();

    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
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

    // show splash modal (unless sub-components have already turned off this flag)
    if (this.configService.showSplashModal) {
      // do this in another event so it's not in current change detection cycle
      setTimeout(() => {
        this.ngbModal = this.modalService.open(SplashModalComponent, { backdrop: 'static', windowClass: 'splash-modal' });
        this.configService.showSplashModal = false;
      });
    }
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
    // do this in another event so it's not in current change detection cycle
    setTimeout(() => {
      // safety check // TODO: remove this when this processing becomes interruptable (see above)
      if (this.isLoading) { return; }

      this.isLoading = true;
      let isFirstPage = true;

      this.showSnackBar();

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
              this.isLoading = false;
              this.hideSnackBar();
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
          this.isLoading = false;
          this.hideSnackBar();
        });
    });
  }

  ngOnDestroy() {
    if (this.ngbModal) { this.ngbModal.dismiss('component destroyed'); }
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Event handler called when Find component updates its filters.
   */
  public updateFindFilters(filters: FiltersType) {
    // console.log('updating find filters =', filters);
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, filters);
    // clear other filters
    this.appexplore.clearAllFilters(false);
    this.appdetail.clearAllFilters();
    this.getApps();

    // we have Find filters -- show Find pane
    // this.toggleFind(true); // DON'T SHOW FIND PANE AUTOMATICALLY
  }

  /**
   * Event handler called when Explore component updates its filters.
   */
  public updateExploreFilters(filters: FiltersType) {
    // console.log('updating explore filters =', filters);
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, filters);
    // clear other filters
    this.appfilters.clearAllFilters(false);
    this.appdetail.clearAllFilters();
    this.getApps();

    // we have Explore filters -- show Explore pane
    // this.toggleExplore(true); // DON'T SHOW EXPLORE PANE AUTOMATICALLY
  }

  /**
   * Event handler called when Details component updates its current app.
   */
  public updateDetails(app: Application, show: boolean) {
    // console.log('updating details, app =', app, 'show =', show);
    this.appmap.onHighlightApplication(app, show);

    // if we have details, show Details pane, else toggle it
    this.toggleDetails(show);
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
   * Called when list component visibility is toggled.
   */
  public toggleAppList() {
    if (this.isApplicationsListVisible) {
      this.isApplicationsListVisible = false;
    } else {
      this.isApplicationsListVisible = true;
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
    if (this.isApplicationsMapVisible) {
      this.isApplicationsMapVisible = false;
    } else {
      this.isApplicationsMapVisible = true;
      // make map visible in next timeslice
      // to visually separate panel opening from data loading
      setTimeout(() => {
        this.appmap.onMapVisible();
      });
    }
  }

  // show Application Details interface
  public toggleDetails(forceShow: boolean = false) {
    // console.log('toggling details, force =', forceShow);
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = (forceShow || !this.isSidePanelVisible || !this.isAppDetailsVisible);

    this.isAppDetailsVisible = true;
    this.isExploreAppsVisible = false;
    this.isFindAppsVisible = false;
    // console.log((this.isSidePanelVisible ? 'setting' : 'clearing') + ' fragment #details');
    this.urlService.setFragment(this.isSidePanelVisible ? 'details' : null);
  }

  // show Explore Applications interface
  public toggleExplore(forceShow: boolean = false) {
    // console.log('toggling explore, force =', forceShow);
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = (forceShow || !this.isSidePanelVisible || !this.isExploreAppsVisible);

    this.isAppDetailsVisible = false;
    this.isExploreAppsVisible = true;
    this.isFindAppsVisible = false;
    // console.log((this.isSidePanelVisible ? 'setting' : 'clearing') + ' fragment #explore');
    this.urlService.setFragment(this.isSidePanelVisible ? 'explore' : null);
  }

  // show Find Applications interface
  public toggleFind(forceShow: boolean = false) {
    // console.log('toggling find, force =', forceShow);
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = (forceShow || !this.isSidePanelVisible || !this.isFindAppsVisible);

    this.isAppDetailsVisible = false;
    this.isExploreAppsVisible = false;
    this.isFindAppsVisible = true;
    // console.log((this.isSidePanelVisible ? 'setting' : 'clearing') + ' fragment #find');
    this.urlService.setFragment(this.isSidePanelVisible ? 'find' : null);
  }

  public closeSidePanel() {
    this.isSidePanelVisible = false;
    // console.log('clearing fragment');
    this.urlService.setFragment(null);
  }

  public resetFilters(filters: FiltersType) {
    // console.log('updateFilters, filters =', filters);
    // NB: first source is 'emptyFilters' to ensure all properties are set
    // this.filters = Object.assign({}, emptyFilters, filters);
    // clear other filters
    this.appfilters.clearAllFilters();
    this.appexplore.clearAllFilters();
    this.appdetail.clearAllFilters();
    this.getApps();
  }

}
