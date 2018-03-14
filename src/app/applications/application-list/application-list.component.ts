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
  private showOnlyOpenApps = false;
  public applications: Array<Application> = [];
  public currentApp: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  @HostBinding('class.full-screen') fullScreen = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // used in template
  ) { }

  ngOnInit() {
    // get optional query parameter
    if (this.route.snapshot.paramMap.has('showOnlyOpenApps')) {
      this.showOnlyOpenApps = true;
    }

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { applications: Application[] }) => {
          if (data.applications) {
            this.applications = data.applications;
            // Tell the main map to draw.
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

  private isCurrentApp(item): boolean {
    return (item === this.currentApp);
  }

  private redrawMap() {
    const self = this;
    const apps = [];
    _.each(this.applications, function (app) {
      if (self.showOnlyOpenApps || self.commentPeriodService.isOpenNotStarted(app.currentPeriod)) {
        apps.push(app);
      }
    });
    this.child.showMaps(apps);
  }

  // TODO: delete if we don't need a hover action for list items
  private showCurrentApp(item) { }

  // TODO: delete if we don't need a select action for list items
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

  private showThisApp(item: Application) {
    // TODO: don't show this app if it's not visible on current map
    return !this.showOnlyOpenApps || this.commentPeriodService.isOpenNotStarted(item.currentPeriod);
  }
}
