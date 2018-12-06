import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './app-detail-popup.component.html',
  styleUrls: ['./app-detail-popup.component.scss']
})

export class AppDetailPopupComponent implements OnInit, OnDestroy {

  @Output() setCurrentApp = new EventEmitter(); // to applications component

  public id: string;
  public app: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public applicationService: ApplicationService, // also used in template
    public commentPeriodService: CommentPeriodService, // used in template
    public configService: ConfigService
  ) { }

  ngOnInit() {
    // load complete application
    this.applicationService.getById(this.id, false)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        value => this.app = value,
        error => console.log(error)
      );
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // show details interface and hide the other in the side panel
  public showAppDetails() {
    this.configService.isSidePanelVisible = true;
    this.configService.isAppDetailsVisible = true;
    this.configService.isExploreAppsVisible = false;
    this.configService.isFindAppsVisible = false;
    this.setCurrentApp.emit(this.app);
  }

}
