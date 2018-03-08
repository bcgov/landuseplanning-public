import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { DialogService } from 'ng2-bootstrap-modal';

import { Application } from '../../models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { AddCommentComponent } from './add-comment/add-comment.component';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
  readonly tabLinks = [
    { label: 'Application', link: 'application' },
    { label: 'Comments', link: 'comments' },
    { label: 'Decisions', link: 'decisions' }
  ];

  public application: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // used in template
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;
          } else {
            // application not found --> navigate back to application list
            alert('Uh-oh, couldn\'t load application');
            this.router.navigate(['/applications']);
          }
        },
        error => {
          console.log(error);
          alert('Uh-oh, couldn\'t load application');
          this.router.navigate(['/applications']);
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private gotoMap() {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }

  private addComment() {
    if (this.application.currentPeriod) {
      this.dialogService.addDialog(AddCommentComponent,
        {
          currentPeriod: this.application.currentPeriod
        }, {
          // index: 0,
          // autoCloseTimeout: 10000,
          // closeByClickingOutside: true,
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe)
        .subscribe((isConfirmed) => {
          // // we get dialog result
          // if (isConfirmed) {
          //   // TODO: reload page?
          //   console.log('saved');
          // } else {
          //   console.log('canceled');
          // }
        });
    }
  }
}
