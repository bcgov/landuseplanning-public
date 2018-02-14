import { Component } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import * as FileSaver from 'file-saver';

import { Comment } from 'app/models/comment';
// import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentService } from 'app/services/comment.service';

export interface DataModel {
  title: string; // not used
  message: string; // not used
  currentPeriod: CommentPeriod;
}

@Component({
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss'],
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

export class AddCommentComponent extends DialogComponent<DataModel, boolean> implements DataModel {
  public title: string;
  public message: string;
  public currentPeriod: CommentPeriod;

  public loading: boolean;
  public comment: Comment;
  // public documents: Array<Document>;
  public showAlert: boolean; // for attachment error
  private currentPage: number;

  constructor(
    public dialogService: DialogService,
    private commentService: CommentService
  ) {
    super(dialogService);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.loading = false;
    this.comment = new Comment({ _commentPeriod: this.currentPeriod });
    // this.documents = new Array<Document>();
    this.showAlert = false;
    this.currentPage = 1;
  }

  private p1_next() { this.currentPage++; }

  private p2_back() { this.currentPage--; }

  private p2_submit() { this.currentPage++; }

  private p3_back() { this.currentPage--; }

  private p3_submit() {
    // TODO: disable Submit button
    this.loading = true;

    // first upload all attached files
    // then save new comment with document ids
    // OR ONE BIG MIME MESS?

    this.commentService.add(this.comment)
      .subscribe(
        data => {
          console.log('Saved comment, data= ', data);
          this.result = true;
          this.currentPage++;
        },
        error => {
          console.log(error);
          this.result = false;
          alert('Error saving comment');
        },
        () => this.loading = false
      );
  }
}
