import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/concat';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/finally';
import * as _ from 'lodash';

import { AppMapComponent } from './app-map/app-map.component';
import { AppListComponent } from './app-list/app-list.component';
import { FindPanelComponent } from './find-panel/find-panel.component';
import { ExplorePanelComponent } from './explore-panel/explore-panel.component';
import { DetailsPanelComponent } from './details-panel/details-panel.component';
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

  @ViewChild('appmap') appmap: AppMapComponent;
  @ViewChild('applist') applist: AppListComponent;
  @ViewChild('findPanel') findPanel: FindPanelComponent;
  @ViewChild('explorePanel') explorePanel: ExplorePanelComponent;
  @ViewChild('detailsPanel') detailsPanel: DetailsPanelComponent;

  public isApplicationsListVisible = false;
  public isExploreAppsVisible = false;
  public isFindAppsVisible = false;
  public isApplicationsMapVisible = true;
  public isSidePanelVisible = false;
  public isAppDetailsVisible = false;

  public isLoading = false; // initial value
  private splashModal: NgbModalRef = null;
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
    public configService: ConfigService,
    public urlService: UrlService,
    private renderer: Renderer2
  ) {
    // watch for URL param changes
    // NB: this must be in constructor to get initial filters
    this.urlService.onNavEnd$
      .takeUntil(this.ngUnsubscribe)
      .subscribe(event => {
        // if we're displaying the splash page then remove any URL fragment
        // so it doesn't interfere with future routing
        if (this.configService.showSplashModal) {
          this.urlService.setFragment(null);
        } else {
          // when we have an URL fragment, show respective panel
          const urlTree = router.parseUrl(event.url);
          if (urlTree && urlTree.fragment) {
            // console.log('got fragment =', urlTree.fragment);
            switch (urlTree.fragment) {
              case 'details': this.toggleDetails(true); break;
              case 'explore': this.toggleExplore(true); break;
              case 'find': this.toggleFind(true); break;
            }
          }
        }
      });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  ngAfterViewInit() {
    // show splash modal (unless sub-components have already turned off this flag)
    if (this.configService.showSplashModal) {
      // do this in another event so it's not in current change detection cycle
      setTimeout(() => {
        this.splashModal = this.modalService.open(SplashModalComponent, { backdrop: 'static', windowClass: 'splash-modal' });
        this.splashModal.result.then(() => { this.configService.showSplashModal = false; });
      });
    }

    // get initial filters
    const findFilters = this.findPanel.getFilters();
    const exploreFilters = this.explorePanel.getFilters();
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, { ...findFilters, ...exploreFilters });

    // get initial map coordinates
    this.coordinates = this.appmap.getCoordinates();

    // TODO: only load initial maps if we have nothing else to display

    // load initial apps
    this.getApps();
  }

  ngOnDestroy() {
    if (this.splashModal) { this.splashModal.dismiss('Splash modal dismissed'); }
    if (this.snackBarRef) { this.hideSnackBar(); }
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // show snackbar
  // NB: use debounce to delay snackbar opening so we can cancel it if loading takes less than 500ms
  // tslint:disable-next-line:member-ordering
  private showSnackBar = _.debounce(() => {
    this.snackBarRef = this.snackBar.open('Loading applications ...');
  }, 500);

  // hide snackbar
  private hideSnackBar() {
    // cancel any pending open
    this.showSnackBar.cancel();

    // if snackbar is showing, dismiss it
    // NB: use debounce to delay snackbar dismiss so it is visible for at least 500ms
    if (this.snackBarRef) {
      _.debounce(() => {
        this.snackBarRef.dismiss();
        this.snackBarRef = null;
      }, 500)();
    }
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

      console.log('getting apps');
      this.showSnackBar();

      this.isLoading = true;
      let isFirstPage = true;

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

  /**
   * Event handler called when Find component updates its filters.
   */
  public updateFindFilters(filters: FiltersType) {
    // console.log('updating find filters =', filters);

    // don't show splash modal
    // since there are parameters, assume the user knows what they're doing
    this.configService.showSplashModal = false;

    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, filters);
    // clear other filters
    this.explorePanel.clearAllFilters(false);
    this.getApps();

    // we have Find filters -- show Find panel
    // this.toggleFind(true); // DON'T SHOW FIND PANEL AUTOMATICALLY
  }

  /**
   * Event handler called when Explore component updates its filters.
   */
  public updateExploreFilters(filters: FiltersType) {
    // console.log('updating explore filters =', filters);

    // don't show splash modal
    // since there are parameters, assume the user knows what they're doing
    this.configService.showSplashModal = false;

    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, filters);
    // clear other filters
    this.findPanel.clearAllFilters(false);
    this.getApps();

    // we have Explore filters -- show Explore panel
    // this.toggleExplore(true); // DON'T SHOW EXPLORE PANEL AUTOMATICALLY
  }

  /**
   * Event handler called when Details component updates its current app.
   */
  public updateDetails(app: Application, show: boolean) {
    // console.log('updating details, app =', app, 'show =', show);

    // don't show splash modal
    // since there are parameters, assume the user knows what they're doing
    this.configService.showSplashModal = false;

    this.appmap.onHighlightApplication(app, show);

    // if we have details, show Details panel, else toggle it
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

  public closeSidePanel() {
    this.isSidePanelVisible = false;

    // if user just closed details panel, unset the app
    if (this.isAppDetailsVisible) {
      this.detailsPanel.clearAllFilters();
    }

    // console.log('clearing fragment');
    this.urlService.setFragment(null);
  }

  public clearFilters() {
    this.findPanel.clearAllFilters();
    this.explorePanel.clearAllFilters();
    this.getApps();
  }

}
