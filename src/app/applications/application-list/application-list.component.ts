import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaginationInstance } from 'ngx-pagination';

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
  public applications: Array<Application>;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };
  private showOnlyOpenApps = true;

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.applications = [];
    // PRC-149: remove work-around change detection bug is fixed
    setTimeout(() => this.getApplications(), 0);
  }

  ngOnDestroy() { }

  private getApplications() {
    this.applications = this.route.snapshot.data.applications.filter(
      application => (!this.showOnlyOpenApps || this.commentPeriodService.isOpenFuture(application.currentPeriod))
    );
    console.log('this.applications =', this.applications);
    // Needed in development mode - not required in prod.
    this._changeDetectionRef.detectChanges();
  }

  private showChange(e) {
    this.showOnlyOpenApps = e.target.checked;
    this.getApplications();
  }
}
