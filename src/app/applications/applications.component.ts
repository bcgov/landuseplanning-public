import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { Observable, Subject, Subscription, concat } from 'rxjs';
import * as operators from 'rxjs/operators';
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

import { SplashModalResult } from './splash-modal/splash-modal.component';

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

  private showSplashModal = false;
  public isLoading = false; // initial value
  private loadInitialApps = true;
  private splashModal: NgbModalRef = null;
  private snackbarRef: MatSnackBarRef<SimpleSnackBar> = null;
  private filters: FiltersType = emptyFilters;
  private coordinates: string = null;
  public apps: Array<Application> = [];
  public totalNumber = 0;
  private observablesSub: Subscription = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public snackbar: MatSnackBar,
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
      .pipe(
        operators.takeUntil(this.ngUnsubscribe)
      )
      .subscribe(event => {
        const urlTree = router.parseUrl(event.url);
        if (urlTree) {
          // if splash modal is open, close it in case user clicked Back
          if (this.splashModal) { this.splashModal.dismiss(); }
          this.isSidePanelVisible = false;
          this.isAppDetailsVisible = false;
          this.isExploreAppsVisible = false;
          this.isFindAppsVisible = false;

          switch (urlTree.fragment) {
            case 'splash': this.showSplashModal = true; break;
            case 'details': this.isSidePanelVisible = this.isAppDetailsVisible = true; break;
            case 'explore': this.isSidePanelVisible = this.isExploreAppsVisible = true; break;
            case 'find': this.isSidePanelVisible = this.isFindAppsVisible = true; break;
          }
        }
      });
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  ngAfterViewInit() {
    // show splash modal (unless a sub-component has already turned off this flag)
    if (this.showSplashModal) {
      // do this in another event so it's not in current change detection cycle
      setTimeout(() => {
        this.splashModal = this.modalService.open(SplashModalComponent, { backdrop: 'static', windowClass: 'splash-modal' });
        this.splashModal.result.then(result => {
          this.splashModal = null;
          this.showSplashModal = false;
          // if user dismissed the modal or clicked Explore then load initial apps
          // otherwise user clicked Find, which will load filtered apps
          switch (result) {
            case SplashModalResult.Dismissed:
              this.urlService.setFragment(null);
              this.getApps();
              break;
            case SplashModalResult.Exploring:
              this.getApps();
              break;
            case SplashModalResult.Finding:
              break;
          }
        });
      });
      return;
    }

    // load initial apps (unless a sub-component has already turned off this flag)
    if (this.loadInitialApps) {
      this.getApps();
    }
  }

  ngOnDestroy() {
    if (this.splashModal) { this.splashModal.dismiss(); }
    if (this.snackbarRef) { this.hideSnackbar(); }
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // show snackbar
  // NB: use debounce to delay snackbar opening so we can cancel it preemptively if loading takes less than 500ms
  // tslint:disable-next-line:member-ordering
  private showSnackbar = _.debounce(() => {
    this.snackbarRef = this.snackbar.open('Loading applications ...');
  }, 500);

  // hide snackbar
  private hideSnackbar() {
    // cancel any pending open
    this.showSnackbar.cancel();

    // if snackbar is showing, dismiss it
    // NB: use debounce to delay snackbar dismissal so it is visible for at least 500ms
    _.debounce(() => {
      if (this.snackbarRef) {
        this.snackbarRef.dismiss();
        this.snackbarRef = null;
      }
    }, 500)();
  }

  private getApps(getTotalNumber: boolean = true) {
    // do this in another event so it's not in current change detection cycle
    setTimeout(() => {
      // pre-empt existing observables execution
      if (this.observablesSub && !this.observablesSub.closed) {
        this.observablesSub.unsubscribe();
      }

      this.showSnackbar();
      this.isLoading = true;
      let isFirstPage = true;

      if (getTotalNumber) {
        // get total number using filters (but not coordinates)
        this.applicationService.getCount(this.filters, null)
          .pipe(
            operators.takeUntil(this.ngUnsubscribe)
          )
          .subscribe(count => {
            this.totalNumber = count;
          });
      }

      // get latest coordinates
      this.coordinates = this.appmap.getCoordinates();

      this.applicationService.getCount(this.filters, this.coordinates)
        .pipe(
          operators.takeUntil(this.ngUnsubscribe)
        )
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
          this.observablesSub = concat(...observables)
            .pipe(
              operators.takeUntil(this.ngUnsubscribe),
              operators.finalize(() => {
                this.isLoading = false;
                this.hideSnackbar();
                console.log('got', this.apps.length, 'apps in', (new Date()).getTime() - start, 'ms');
              })
            )
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
          this.hideSnackbar();
        });
    });
  }

  /**
   * Event handler called when Find component updates its filters.
   */
  public updateFindFilters(findFilters: FiltersType) {
    this.loadInitialApps = false; // skip initial app load
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, findFilters);
    // clear other filters
    this.explorePanel.clearAllFilters(false);
    this.getApps();
    // don't show Find panel automatically
  }

  /**
   * Event handler called when Explore component updates its filters.
   */
  public updateExploreFilters(exploreFilters: FiltersType) {
    this.loadInitialApps = false; // skip initial app load
    // NB: first source is 'emptyFilters' to ensure all properties are set
    this.filters = Object.assign({}, emptyFilters, exploreFilters);
    // clear other filters
    this.findPanel.clearAllFilters(false);
    this.getApps();
    // don't show Explore panel automatically
  }

  /**
   * Event handler called when Details component updates/clears its current app.
   */
  public updateDetails(app: Application, show: boolean) {
    this.appmap.onHighlightApplication(app, show);
    // show/hide Details panel
    this.isSidePanelVisible = show;
    this.isAppDetailsVisible = true;
    this.urlService.setFragment(this.isSidePanelVisible ? 'details' : null);
  }

  /**
   * Event handler called when map component view has changed.
   */
  public updateCoordinates() {
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
  public toggleFind() {
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = (!this.isSidePanelVisible || !this.isFindAppsVisible);

    this.isAppDetailsVisible = false;
    this.isExploreAppsVisible = false;
    this.isFindAppsVisible = true;
    this.urlService.setFragment(this.isSidePanelVisible ? 'find' : null);
  }

  // show Explore Applications interface
  public toggleExplore() {
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = (!this.isSidePanelVisible || !this.isExploreAppsVisible);

    this.isAppDetailsVisible = false;
    this.isExploreAppsVisible = true;
    this.isFindAppsVisible = false;
    this.urlService.setFragment(this.isSidePanelVisible ? 'explore' : null);
  }

  // show Application Details interface
  public toggleDetails() {
    // show side panel if it's hidden or THIS component isn't already visible
    this.isSidePanelVisible = (!this.isSidePanelVisible || !this.isAppDetailsVisible);

    this.isAppDetailsVisible = true;
    this.isExploreAppsVisible = false;
    this.isFindAppsVisible = false;
    this.urlService.setFragment(this.isSidePanelVisible ? 'details' : null);
  }

  public disableSplash() {
    // this is called by Find/Explore when they have filters to apply or by Details when it has an app to display
    // ie, on init, if the above are true then bypass the splash modal
    this.showSplashModal = false;
  }

  public closeSidePanel() {
    this.isSidePanelVisible = false;

    // if user just closed details panel, unset the app
    if (this.isAppDetailsVisible) {
      this.detailsPanel.clearAllFilters();
    }

    this.urlService.setFragment(null);
  }

  public clearFilters() {
    this.findPanel.clearAllFilters(false);
    this.explorePanel.clearAllFilters(false);
    this.filters = emptyFilters;
    this.getApps();
  }

}
