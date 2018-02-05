import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { DialogService } from 'ng2-bootstrap-modal';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';

import { ViewCommentComponent } from './view-comment/view-comment.component';

@Component({
  // selector: 'app-comments-tab-content',
  templateUrl: './comments-tab-content.component.html',
  styleUrls: ['./comments-tab-content.component.scss']
})
export class CommentsTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public comments: Array<Comment>;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.comments = new Array<Comment>();

    this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.commentService.getAllByApplicationId(data.application._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
            comments => {
              comments.forEach(comment => {
                this.comments.push(comment);
              });
            },
            error => console.log(error)
            );
        }
      },
      error => console.log(error),
      () => this.loading = false
    );
  }

  ngOnDestroy(): void {
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
