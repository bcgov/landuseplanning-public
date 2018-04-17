import { HostBinding, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  public applications: Array<Application> = [];
  public currentApp: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public cpStatusFilters: Object; // array-like object
  public cpStatusKeys: string[] = null;
  public appStatusFilters: Object; // array-like object
  public appStatusKeys: string[] = null;
  public applicantFilter: string = null;
  public clFileFilter: number = null;
  public dispIdFilter: number = null;
  public purposeFilter: string = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // also used in template
  ) {
    this.resetFilters(null); // init
  }

  public visibleLayer(app) {
    // toggle visibility of left-hand list items
    const self = this;
    const f = _.find(self.applications, { tantalisID: app.tantalisID });
    if (f) {
      f.isVisible = app.isVisible;
    }
  }

  ngOnInit() {
    // get optional route parameter (matrix URL notation)
    if (this.route.snapshot.paramMap.get('showOnlyOpenApps') === 'true') {
      this.cpStatusFilters['Closed'] = false;
      this.cpStatusFilters['Not Open'] = false;
    }

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { applications: Application[] }) => {
          if (data.applications) {
            // sort by newest first
            this.applications = data.applications.sort((a: Application, b: Application) => {
              return (a.publishDate < b.publishDate) ? 1 : -1;
            });
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

  public isCurrentApp(item): boolean {
    return (item === this.currentApp);
  }

  public redrawMap() {
    const apps = [];
    this.applications.forEach(app => {
      if (this.showThisApp(app)) {
        apps.push(app);
      }
    });
    this.child.showMaps(apps);
  }

  private setCurrentApp(item) {
    const index = _.findIndex(this.applications, { _id: item._id });
    if (index >= 0) {
      this.applications.splice(index, 1, item);
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
  // TODO: don't show this app if it's not visible on current map
  private showThisApp(item: Application) {
    // console.log('purposeFilter =', this.purposeFilter);
    const matchCPStatus = (this.cpStatusFilters['Closed'] && this.commentPeriodService.isClosed(item.currentPeriod))
      || (this.cpStatusFilters['Not Open'] && this.commentPeriodService.isNotOpen(item.currentPeriod))
      || (this.cpStatusFilters['Not Started'] && this.commentPeriodService.isNotStarted(item.currentPeriod))
      || (this.cpStatusFilters['Open'] && this.commentPeriodService.isOpen(item.currentPeriod));
    const matchAppStatus = true; // TODO
    const matchApplicant = !this.applicantFilter || !item.client
      || item.client.match(new RegExp(this.applicantFilter, 'i'));
    const matchCLFile = !this.clFileFilter || !item.cl_file
      || item.cl_file.toString().match(new RegExp(this.clFileFilter.toString(), 'i'));
    const matchDispId = !this.dispIdFilter || !item.tantalisID ||
      item.tantalisID.toString().match(new RegExp(this.dispIdFilter.toString(), 'i'));
    const matchPurpose = !this.purposeFilter || !item.purpose || !item.subpurpose
      || item.purpose.match(new RegExp(this.purposeFilter, 'i'))
      || item.subpurpose.match(new RegExp(this.purposeFilter, 'i'));

    return matchCPStatus && matchAppStatus && matchApplicant && matchCLFile && matchDispId && matchPurpose;
  }

  public applyFilters(e: Event) {
    if (e) {
      e.preventDefault();
      this.redrawMap();
    }
  }

  // TODO: fix case where showOnlyOpenApps=true (see ngOnInit)
  public resetFilters(e: Event) {
    this.cpStatusFilters = {
      'Open': true,
      'Not Started': true,
      'Closed': true,
      'Not Open': true
    };
    this.cpStatusKeys = Object.keys(this.cpStatusFilters);

    this.appStatusFilters = {
      'Application Under Review': true,
      'Decision Made': true,
      'Application Cancelled': true,
      'Application Abandoned': true,
      'Tenure: Disposition in Good Standing': true,
      'Tenure: Suspended': true
    };
    this.appStatusKeys = Object.keys(this.appStatusFilters);

    this.applicantFilter = null;
    this.clFileFilter = null;
    this.dispIdFilter = null;
    this.purposeFilter = null;

    if (e) {
      e.preventDefault();
      this.redrawMap();
    }
  }

  public cpStatusFilterClick(key: string) {
    this.cpStatusFilters[key] = !this.cpStatusFilters[key];
    this.redrawMap();
  }

  public appStatusFilterClick(key: string) {
    this.appStatusFilters[key] = !this.appStatusFilters[key];
    this.redrawMap();
  }

  public cpStatusCount(): number {
    return this.cpStatusKeys.filter(key => this.cpStatusFilters[key]).length;
  }

  public appStatusCount(): number {
    return this.appStatusKeys.filter(key => this.appStatusFilters[key]).length;
  }
}
