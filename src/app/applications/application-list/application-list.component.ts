import { ChangeDetectorRef, ChangeDetectionStrategy, HostBinding, Component, OnInit, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';

import { Application } from '../../models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from '../../services/commentperiod.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // PRC-149: improve change detection
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  private showOnlyOpenApps = false;
  public applications: Array<Application> = [];
  public currentApp: Application = null;

  @HostBinding('class.full-screen') fullScreen = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService, // used in template
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // get data directly from resolver
    this.applications = this.route.snapshot.data.applications;

    // applications not found --> navigate back to home
    if (!this.applications) {
      alert('Uh-oh, applications not found');
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() { }

  private isCurrentApp(item): boolean {
    return (item === this.currentApp);
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
      } else {
        this.currentApp = null; // unset
      }
    }
  }

  private showThisApp(item: Application) {
    // TODO: don't show this app if it's not visible on current map
    return !this.showOnlyOpenApps || this.commentPeriodService.isOpenNotStarted(item.currentPeriod);
  }
}
