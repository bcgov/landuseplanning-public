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
  // TODO: improve change detection
  // https://blog.thoughtram.io/angular/2016/02/22/angular-2-change-detection-explained.html
  // https://blog.angular-university.io/how-does-angular-2-change-detection-really-work/
  // https://blog.angular-university.io/onpush-change-detection-how-it-works/
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ApplicationListComponent implements OnInit, OnDestroy {
  public applications: Array<Application>;
  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };
  private showOnlyOpenApps = false; // TODO: fix change detection bug when initially true

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commentPeriodService: CommentPeriodService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.applications = [];
    this.getApplications();
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
