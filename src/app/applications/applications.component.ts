import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/finally';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';
// import { FiltersType } from 'app/applications/applist-filters/applist-filters.component'; // FUTURE

// NB: this number was chosen (by profiling) to give reasonable app loading feedback
//     without the overhead of doing too much work
const PAGE_SIZE = 100;

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})

export class ApplicationsComponent implements OnInit, OnDestroy {
  @ViewChild('appmap') appmap;
  @ViewChild('applist') applist;
  @ViewChild('appfilters') appfilters;

  // FUTURE: change this to an observable and components subscribe to changes ?
  // ref: https://github.com/escardin/angular2-community-faq/blob/master/services.md#how-do-i-communicate-between-components-using-a-shared-service
  // ref: https://stackoverflow.com/questions/34700438/global-events-in-angular
  private _loading = false;
  set isLoading(val: boolean) {
    this._loading = val;
    if (val) {
      this.appfilters.onLoadStart();
      this.appmap.onLoadStart();
      this.applist.onLoadStart();
    } else {
      this.appfilters.onLoadEnd();
      this.appmap.onLoadEnd();
      this.applist.onLoadEnd();
    }
  }

  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  public allApps: Array<Application> = [];
  public filterApps: Array<Application> = [];
  public mapApps: Array<Application> = [];
  public listApps: Array<Application> = [];
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
    // do this in another event so it's not in current change detection cycle
    setTimeout(() => {
      const start = (new Date()).getTime(); // for profiling
      this.isLoading = true;
      this.snackBarRef = this.snackBar.open('Loading applications ...');
      this.allApps = []; // empty the list

      this.applicationService.getCount()
        .takeUntil(this.ngUnsubscribe)
        .subscribe(count => {
          // prepare 'pages' of gets
          const observables: Array<Observable<Application[]>> = [];
          for (let page = 0; page < Math.ceil(count / PAGE_SIZE); page++) {
            observables.push(this.applicationService.getAllFull(page, PAGE_SIZE));
          }

          // get all observables sequentially
          Observable.of([] as Application[]).concat(...observables)
            .takeUntil(this.ngUnsubscribe)
            .finally(() => {
              this.snackBarRef.dismiss();
              this.isLoading = false;
              console.log('getting apps took', (new Date()).getTime() - start, 'ms');
            })
            .subscribe(applications => {
              this.allApps = _.concat(this.allApps, applications);
              // filter component gets all apps
              this.filterApps = this.allApps;
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
    }, 0);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Event handler called when filters component updates list of matching apps.
   */
  public updateMatching() {
    // map component gets filtered apps
    this.mapApps = this.filterApps.filter(a => a.isMatches);
    // NB: OnChanges event will update the map
  }

  /**
   * Event handler called when map component updates list of visible apps.
   */
  public updateVisible() {
    // list component gets visible apps
    this.listApps = this.mapApps.filter(a => a.isVisible);
    // NB: OnChanges event will update the list
  }

  /**
   * Event handler called when map component reset button is clicked.
   */
  public reloadApps() {
    this.getApps();
  }

  /**
   * Event handler called when list component selects or unselects an app.
   */
  public highlightApplication(app: Application, show: boolean) {
    this.appmap.onHighlightApplication(app, show);
  }

  /**
   * Called when list component visibility is toggled.
   */
  public toggleAppList() { this.appmap.toggleAppList(); }
}
