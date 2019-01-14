import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Comment } from 'app/models/comment';
import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';

export interface DataModel {
  title: string; // not used
  message: string; // not used
  commentId: string;
}

@Component({
  templateUrl: './view-comment.component.html',
  styleUrls: ['./view-comment.component.scss']
})

// NOTE: normally, dialog components must not implement OnDestroy
//       otherwise they don't return a result
//       but in this case there is no result, so it's OK!
export class ViewCommentComponent extends DialogComponent<DataModel, boolean> implements DataModel, OnInit, OnDestroy {
  public title: string;
  public message: string;
  public commentId: string;
  public comment: Comment;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogService: DialogService,
    private api: ApiService,
    private commentService: CommentService
  ) {
    super(dialogService);
  }

  ngOnInit() {
    this.comment = null;

    this.commentService.getById(this.commentId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        comment => this.comment = comment,
        error => console.log(error)
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
