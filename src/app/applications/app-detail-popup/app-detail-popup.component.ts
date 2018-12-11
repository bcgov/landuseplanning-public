import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './app-detail-popup.component.html',
  styleUrls: ['./app-detail-popup.component.scss']
})

export class AppDetailPopupComponent implements OnInit, OnDestroy {

  public id: string;
  public app: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public applicationService: ApplicationService, // also used in template
    public commentPeriodService: CommentPeriodService // used in template
  ) { }

  public ngOnInit() {
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

  // show Details pane for this app
  public showDetails() {
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { id: this.app._id }, fragment: 'details', replaceUrl: true });
  }

}
