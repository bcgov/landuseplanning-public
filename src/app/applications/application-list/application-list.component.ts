import { HostBinding, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { MainMapComponent } from 'app/map/main-map/main-map.component';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  @ViewChild(MainMapComponent) child: MainMapComponent;
  public cpStatusKeys: Array<string> = [];
  public appStatusKeys: Array<string> = [];
  private paramMap: ParamMap = null;
  private allApps: Array<Application> = [];
  public filteredApps: Array<Application> = []; // TODO: add filtered property to allApps instead (single array)
  public currentApp: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  // public showFilters = true;
  public cpStatusFilters: Object = {}; // array-like object
  public appStatusFilters: Object = {}; // array-like object
  public applicantFilter: string = null;
  public clFileFilter: number = null;
  public dispIdFilter: number = null;
  public purposeFilter: string = null;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // also used in template
  ) {
    this.cpStatusKeys.push(this.commentPeriodService.OPEN);
    this.cpStatusKeys.push(this.commentPeriodService.NOT_STARTED);
    this.cpStatusKeys.push(this.commentPeriodService.CLOSED);
    this.cpStatusKeys.push(this.commentPeriodService.NOT_OPEN);

    this.appStatusKeys.push(this.applicationService.DECISION_MADE);
    this.appStatusKeys.push(this.applicationService.CANCELLED);
    this.appStatusKeys.push(this.applicationService.ABANDONED);
    this.appStatusKeys.push(this.applicationService.DISPOSITION_GOOD_STANDING);
    this.appStatusKeys.push(this.applicationService.SUSPENDED);
  }

  public visibleLayer(app) {
    // toggle visibility of left-hand list items
    const self = this;
    const f = _.find(self.filteredApps, { tantalisID: app.tantalisID });
    if (f) {
      f.isVisible = app.isVisible;
    }
  }

  ngOnInit() {
    // get optional query parameters
    this.route.queryParamMap
      .takeUntil(this.ngUnsubscribe)
      .subscribe(paramMap => {
        this.paramMap = paramMap;

        // set initial filters
        this.resetFilters(null);
      });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { applications: Application[] }) => {
          if (data.applications) {
            // sort by newest first
            this.allApps = data.applications.sort((a: Application, b: Application) => {
              return (a.publishDate < b.publishDate) ? 1 : -1;
            });

            // apply initial filtering
            this.applyFilters(null);

            // tell the main map to draw
            this.child.drawMap(data.applications);
          } else {
            // applications not found --> navigate back to home
            alert('Uh-oh, couldn\'t load applications');
            this.router.navigate(['/']);
          }
        },
        error => {
          console.log(error);
          alert('Uh-oh, couldn\'t load applications');
          this.router.navigate(['/']);
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // public getShowFilters(): boolean {
  //   return (this.showFilters);
  // }

  // public setShowFilters(tf: boolean) {
  //   this.showFilters = tf;
  // }

  public isCurrentApp(item): boolean {
    return (item === this.currentApp);
  }

  public redrawMap() {
    const apps = [];
    this.filteredApps.forEach(app => {
      if (this.showThisApp(app)) {
        apps.push(app);
      }
    });
    this.child.showMaps(apps);
  }

  private setCurrentApp(item) {
    const index = _.findIndex(this.filteredApps, { _id: item._id });
    if (index >= 0) {
      this.filteredApps.splice(index, 1, item);
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
        this.child.highlightApplication(item, true);
      } else {
        this.currentApp = null; // unset
        this.child.highlightApplication(item, false);
      }
    }
  }

  // TODO: fix case where there are no matching applications
  private showThisApp(item: Application) {
    const allCpStatus = this.cpStatusKeys.every(key => {
      return (this.cpStatusFilters[key] === false);
    });

    const matchCpStatus = (
      allCpStatus
      || (this.cpStatusFilters[this.commentPeriodService.OPEN]
        && this.commentPeriodService.isOpen(item.currentPeriod))
      || (this.cpStatusFilters[this.commentPeriodService.NOT_STARTED]
        && this.commentPeriodService.isNotStarted(item.currentPeriod))
      || (this.cpStatusFilters[this.commentPeriodService.CLOSED]
        && this.commentPeriodService.isClosed(item.currentPeriod))
      || (this.cpStatusFilters[this.commentPeriodService.NOT_OPEN]
        && this.commentPeriodService.isNotOpen(item.currentPeriod))
    );

    const allAppStatus = this.appStatusKeys.every(key => {
      return (this.appStatusFilters[key] === false);
    });

    const matchAppStatus = (
      allAppStatus
      || (this.appStatusFilters[this.applicationService.ACCEPTED]
        && this.applicationService.isAccepted(item.status))
      || (this.appStatusFilters[this.applicationService.DECISION_MADE]
        && this.applicationService.isDecision(item.status)
        && !this.applicationService.isCancelled(item.status))
      || (this.appStatusFilters[this.applicationService.CANCELLED]
        && this.applicationService.isCancelled(item.status))
      || (this.appStatusFilters[this.applicationService.ABANDONED]
        && this.applicationService.isAbandoned(item.status))
      || (this.appStatusFilters[this.applicationService.DISPOSITION_GOOD_STANDING]
        && this.applicationService.isDispGoodStanding(item.status))
      || (this.appStatusFilters[this.applicationService.SUSPENDED]
        && this.applicationService.isSuspended(item.status))
    );

    const matchApplicant = !this.applicantFilter || !item.client
      || item.client.match(new RegExp(this.applicantFilter, 'i'));

    const matchCLFile = !this.clFileFilter || !item.cl_file
      || item.cl_file.toString().match(new RegExp(this.clFileFilter.toString(), 'i'));

    const matchDispId = !this.dispIdFilter || !item.tantalisID ||
      item.tantalisID.toString().match(new RegExp(this.dispIdFilter.toString(), 'i'));

    const matchPurpose = !this.purposeFilter || !item.purpose || !item.subpurpose
      || item.purpose.match(new RegExp(this.purposeFilter, 'i'))
      || item.subpurpose.match(new RegExp(this.purposeFilter, 'i'));

    return matchCpStatus && matchAppStatus && matchApplicant && matchCLFile && matchDispId && matchPurpose;
  }

  public applyFilters(e: Event) {
    this.filteredApps = this.allApps.filter(app => this.showThisApp(app));

    if (e) {
      this.saveFilters();
      e.preventDefault();
      this.redrawMap();
    }
  }

  private saveFilters() {
    const params: Params = {};

    this.cpStatusKeys.forEach(key => {
      if (this.cpStatusFilters[key]) {
        if (!params['cpStatus']) {
          params['cpStatus'] = key;
        } else {
          params['cpStatus'] += '|' + key;
        }
      }
    });

    this.appStatusKeys.forEach(key => {
      if (this.appStatusFilters[key]) {
        if (!params['appStatus']) {
          params['appStatus'] = key;
        } else {
          params['appStatus'] += '|' + key;
        }
      }
    });

    if (this.applicantFilter) {
      params['applicant'] = this.applicantFilter;
    }

    if (this.clFileFilter !== null) {
      params['clFile'] = this.clFileFilter;
    }

    if (this.dispIdFilter !== null) {
      params['dispId'] = this.dispIdFilter;
    }

    if (this.purposeFilter) {
      params['purpose'] = this.purposeFilter;
    }

    // change browser URL without reloading page (so any query params are saved in history)
    this.location.go(this.router.createUrlTree([], { relativeTo: this.route, queryParams: params }).toString());
  }

  public resetFilters(e: Event) {
    // set cpStatus filters according to current param options
    const cpStatus = this.paramMap.get('cpStatus') || '';
    this.cpStatusKeys.forEach(key => {
      this.cpStatusFilters[key] = cpStatus.includes(key);
    });

    // set appStatus filters according to current param options
    const appStatus = this.paramMap.get('appStatus') || '';
    this.appStatusKeys.forEach(key => {
      this.appStatusFilters[key] = appStatus.includes(key);
    });

    this.applicantFilter = this.paramMap.get('applicant');
    this.clFileFilter = this.paramMap.get('clFile') ? +this.paramMap.get('clFile') : null;
    this.dispIdFilter = this.paramMap.get('dispId') ? +this.paramMap.get('dispId') : null;
    this.purposeFilter = this.paramMap.get('purpose');

    this.applyFilters(e);
  }

  public cpStatusCount(): number {
    return this.cpStatusKeys.filter(key => this.cpStatusFilters[key]).length;
  }

  public appStatusCount(): number {
    return this.appStatusKeys.filter(key => this.appStatusFilters[key]).length;
  }

  public cpStatusFilterClick(key: string) {
    this.cpStatusFilters[key] = !this.cpStatusFilters[key];
  }

  public appStatusFilterClick(key: string) {
    this.appStatusFilters[key] = !this.appStatusFilters[key];
  }

}
