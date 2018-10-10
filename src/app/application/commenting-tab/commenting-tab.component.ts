import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as moment from 'moment';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

import { ViewCommentComponent } from './view-comment/view-comment.component';

@Component({
  templateUrl: './commenting-tab.component.html',
  styleUrls: ['./commenting-tab.component.scss'],
  animations: [
    trigger('visibility', [
      transition(':enter', [   // :enter is alias to 'void => *'
        animate('0.2s 0s', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('0.2s 0.75s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CommentingTabComponent implements OnInit, OnDestroy {
  public loading = true;
  public application: Application = null;
  public comments: Array<Comment> = [];
  public daysRemaining = '?';
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    public commentPeriodService: CommentPeriodService, // used in template
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    // get application
    this.activatedRoute.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;

            // get comment period days remaining
            if (this.application.currentPeriod) {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              // use moment to handle Daylight Saving Time changes
              const days = moment(this.application.currentPeriod.endDate).diff(moment(today), 'days') + 1;
              this.daysRemaining = days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining';
            }

            // get application comments
            this.commentService.getAllByApplicationId(this.application._id)
              .takeUntil(this.ngUnsubscribe)
              .subscribe((comments: Comment[]) => {
                this.comments = comments;

                // sort by date added
                this.comments.sort(function (a: Comment, b: Comment) {
                  return (new Date(a.dateAdded) > new Date(b.dateAdded) ? 1 : -1);
                });
                this.loading = false;
              },
                error => {
                  console.log(error);
                  this.loading = false;
                }
              );
          } else {
            alert('Uh-oh, couldn\'t load application');
            this.loading = false;
            // application not found --> navigate back to application list
            this.router.navigate(['/applications']);
          }
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private viewDetails(commentId: string) {
    this.dialogService.addDialog(ViewCommentComponent,
      {
        commentId: commentId
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
