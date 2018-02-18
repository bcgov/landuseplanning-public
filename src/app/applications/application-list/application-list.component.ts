import { ChangeDetectorRef, ChangeDetectionStrategy, HostBinding, Component, OnInit, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { Application } from '../../models/application';
import { ApplicationService } from '../../services/application.service';
import { CommentPeriodService } from '../../services/commentperiod.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // PRC-149: improve change detection
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  private showOnlyOpenApps = false;
  public applications: Array<Application>;
  public currentApp: Application;

  @HostBinding('class.full-screen') fullScreen = true;

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.applications = null;
    // PRC-149: remove work-around when change detection bug is fixed
    setTimeout(() => this.getApplications(), 100);
  }

  ngOnDestroy() { }

  private getApplications() {
    // approach 1: get data directly from resolver
    this.applications = this.route.snapshot.data.applications.filter(
      application => (!this.showOnlyOpenApps || this.commentPeriodService.isOpenNotStarted(application.currentPeriod))
    );

    // approach 2: wait for resolver to retrieve applications
    // this.route.data.subscribe(
    //   (data: { applications: Application[] }) => {
    //     this.applications = data.applications.filter(
    //       application => (!this.showOnlyOpenApps || this.commentPeriodService.isOpenNotStarted(application.currentPeriod))
    //     );
    //   },
    //   error => console.log(error)
    // );

    // Needed in development mode - not required in prod.
    this._changeDetectionRef.detectChanges();
  }

  private isCurrentApp(item): boolean {
    // return _.isMatch(this.currentComment, item);
    return (item === this.currentApp);
  }

  // TODO: delete if we don't need a hover action for list items
  private showCurrentApp(item) {
  }

  // TODO: delete if we don't need a select action for list items
  private setCurrentApp(item) {
    const index = _.findIndex(this.applications, { _id: item._id });
    if (index >= 0) {
      this.applications.splice(index, 1, item);
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
      } else {
        this.currentApp = null; // unset
      }
    }
  }

  private showChange(e) {
    this.showOnlyOpenApps = e.checked;
    this.getApplications();
  }
}
