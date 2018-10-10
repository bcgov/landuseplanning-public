import { Component } from '@angular/core';
import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './app-detail-popup.component.html',
  styleUrls: ['./app-detail-popup.component.scss']
})

export class AppDetailPopupComponent {
  public app: Application = null;

  constructor(
    public applicationService: ApplicationService, // used in template
    public commentPeriodService: CommentPeriodService // used in template
  ) { }
}
