import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { UrlService } from 'app/services/url.service';

@Component({
  templateUrl: './marker-popup.component.html',
  styleUrls: ['./marker-popup.component.scss']
})
export class MarkerPopupComponent implements OnInit, OnDestroy {
  public id: string;
  public app: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public applicationService: ApplicationService, // also used in template
    public commentPeriodService: CommentPeriodService, // used in template
    public urlService: UrlService
  ) {}

  public ngOnInit() {
    // load complete application
    this.applicationService
      .getById(this.id, false)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => (this.app = value), error => console.log(error));
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // show Details panel for this app
  public showDetails() {
    this.urlService.save('id', this.app._id);
    this.urlService.setFragment('details');
  }
}
