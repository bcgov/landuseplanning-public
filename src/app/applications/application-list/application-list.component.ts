import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
  @ViewChild(MainMapComponent) mainMap: MainMapComponent;

  public showOnlyOpenApps = false;
  public loading = true;
  private allApps: Array<Application> = [];
  public filteredApps: Array<Application> = []; // FUTURE: add filtered property to allApps instead (single array)
  public currentApp: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // also used in template
  ) { }

  ngOnInit() {
    // get optional route parameter (matrix URL notation)
    this.showOnlyOpenApps = (this.route.snapshot.paramMap.get('showOnlyOpenApps') === 'true');

    // get data
    this.applicationService.getAll()
      .takeUntil(this.ngUnsubscribe)
      .subscribe(applications => {
        // sort by newest first
        this.allApps = applications.sort((a: Application, b: Application) => {
          return (a.publishDate < b.publishDate) ? 1 : -1;
        });

        // apply initial filtering
        this.applyFilters(null);

        // draw the initial map
        this.mainMap.drawMap(this.filteredApps);

        this.loading = false;
      }, error => {
        console.log(error);
        alert('Uh-oh, couldn\'t load applications');
        this.loading = false;
        // applications not found --> navigate back to home
        this.router.navigate(['/']);
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public isCurrentApp(item): boolean {
    return (item === this.currentApp);
  }

  // set visibility of specified list item
  public visibleLayer(item) {
    const app = _.find(this.filteredApps, { tantalisID: item.tantalisID });
    if (app) {
      app.isVisible = item.isVisible;
    }
  }

  private setCurrentApp(item) {
    const index = _.findIndex(this.filteredApps, { _id: item._id });
    if (index >= 0) {
      this.filteredApps.splice(index, 1, item);
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
        this.mainMap.highlightApplication(item, true);
      } else {
        this.currentApp = null; // unset
        this.mainMap.highlightApplication(item, false);
      }
    }
  }

  public applyFilters(e: Event) {
    this.filteredApps = this.allApps.filter(app => this.showThisApp(app));

    // if called from UI, redraw map
    // otherwise this is part of init
    if (e) {
      this.mainMap.drawMap(this.filteredApps);
    }
  }

  private showThisApp(item: Application) {
    return !this.showOnlyOpenApps
      || this.commentPeriodService.isOpen(item.currentPeriod)
      || this.commentPeriodService.isNotStarted(item.currentPeriod);
  }

  public appsCount(): number {
    return this.filteredApps.filter(app => app.isVisible).length;
  }

}
