import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { DialogService } from 'ng2-bootstrap-modal';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

import { ViewCommentComponent } from './view-comment/view-comment.component';

@Component({
  templateUrl: './comments-tab-content.component.html',
  styleUrls: ['./comments-tab-content.component.scss'],
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
export class CommentsTabContentComponent implements OnInit, OnDestroy {
  public loading = true;
  public application: Application;
  public comments: Array<Comment>;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private commentPeriodService: CommentPeriodService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    // NOTE: leave this.application and this.comments undefined

    // get application
    this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.application = data.application;

          // get application comments
          this.commentService.getAllByApplicationId(this.application._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              comments => {
                this.comments = comments;
                // sort by date
                // DOESN'T WORK BECAUSE WE DON'T HAVE THE COMMENTS YET
                // MAY NEED TO USE PROMISE/THEN()
                this.comments.sort(function (a: Comment, b: Comment) {
                  return (a.dateAdded > b.dateAdded) ? 1 : -1;
                });
                this.loading = false;
              },
              error => {
                console.log(error);
                this.loading = false;
              }
            );
        } else {
          console.log('ERROR =', 'missing application');
          this.loading = false;
        }
      },
      error => {
        console.log(error);
        this.loading = false;
      }
    );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private isUndefined(x): boolean {
    return (typeof x === 'undefined');
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
