import { Component } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentService } from 'app/services/comment.service';
import { ApiService } from 'app/services/api';

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

  public submitting = false;
  public progressValue = 0;
  public comment: Comment;
  public documents: Array<Document>;
  private currentPage = 1;
  private files: Array<File> = [];

  constructor(
    public dialogService: DialogService,
    private commentService: CommentService,
    private api: ApiService
  ) {
    super(dialogService);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.comment = new Comment();
    this.comment._commentPeriod = this.currentPeriod._id;
    this.comment.commentAuthor.requestedAnonymous = false;
    this.documents = new Array<Document>();

    // DEBUGGING - remove before submitting
    this.comment.commentAuthor.contactName = 'Test Name';
    this.comment.commentAuthor.location = 'Test Location';
    this.comment.commentAuthor.internal.email = 'Test Email';
    this.comment.comment = 'Test Comment';
  }

  private p1_next() { this.currentPage++; }

  private p2_back() { this.currentPage--; }

  private p2_submit() { this.currentPage++; }

  private p3_back() { this.currentPage--; }

  private p3_submit() {
    this.submitting = true;
    this.result = true; // assume success - override as needed

    // approximate size of everything for progress reporting
    const commentSize = this.sizeof(this.comment);
    let totalSize = commentSize;
    this.files.forEach(file => totalSize += file.size);

    // first POST new comment
    // TODO: use promise so we can use then() for documents
    this.commentService.add(this.comment)
      .subscribe(
        value => {
          this.progressValue += 100 * commentSize / totalSize;
          console.log('comment =', value);
          this.comment = value;
        },
        error => {
          console.log(error);
          this.result = false;
          alert('Error saving comment');
        }
      );

    // then UPLOAD all documents with comment id back-ref
    // TODO: display status (on spinner?) as each file upload completes
    this.files.forEach((file: File) => {
      const formData = new FormData();
      formData.append('_comment', this.comment._id);
      formData.append('displayName', file.name);
      formData.append('upfile', file);
      this.api.uploadDocument(formData)
        .subscribe(
          value => {
            this.progressValue += 100 * file.size / totalSize;
            console.log('document =', value);
          },
          error => {
            console.log('error =', error);
            this.result = false;
            alert('Error saving document');
          }
        );
    });

    // TODO: only call this when everything completes (or fails)
    this.submitting = false;
    this.currentPage++;
  }

  // approximate size (keys + data)
  private sizeof(object: Object) {
    let bytes = 0;

    Object.keys(object).forEach(key => {
      bytes += key.length;
      const obj = object[key];
      switch (typeof obj) {
        case 'boolean': bytes += 4; break;
        case 'number': bytes += 8; break;
        case 'string': bytes += 2 * obj.length; break;
        case 'object': if (obj) { bytes += this.sizeof(obj); } break;
      }
    });
    return bytes;
  }
}
