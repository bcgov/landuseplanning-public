import { Component } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';

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

  private submitting = false;
  private progressValue: number;
  private totalSize: number;
  private currentPage = 1;
  private comment: Comment;
  private documents: Array<Document> = [];
  private files: Array<File> = [];

  constructor(
    public dialogService: DialogService,
    private commentService: CommentService,
    private documentService: DocumentService
  ) {
    super(dialogService);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.comment = new Comment();
    this.comment._commentPeriod = this.currentPeriod._id;
    this.comment.commentAuthor.requestedAnonymous = false;

    // DEBUGGING - remove before final submit
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
    // approximate size of everything for progress reporting
    const commentSize = this.sizeof(this.comment);
    this.totalSize = commentSize;
    this.files.forEach(file => this.totalSize += file.size);
    this.progressValue = 0;

    // only show submitting for larger submissions
    if (this.totalSize > 100000) {
      this.submitting = true;
    }

    // first add new comment
    this.commentService.add(this.comment).toPromise()
      .then(
        comment => {
          this.progressValue += 100 * commentSize / this.totalSize;
          this.comment = comment;
          return comment;
        },
        error => { throw error; }
      )
      .then(comment => {
        // then upload all documents
        const promises: Array<Promise<Document>> = [];

        this.files.forEach(file => {
          const formData = new FormData();
          formData.append('_comment', this.comment._id);
          formData.append('displayName', file.name);
          formData.append('upfile', file);
          promises.push(this.documentService.upload(formData).toPromise()
            .then(
              document => {
                this.progressValue += 100 * file.size / this.totalSize;
                console.log('document =', document);
                return document;
              },
              error => { throw error; }
            )
            .catch(error => { return Promise.reject(error); })
          );
        });

        // execute all uploads in parallel
        return Observable.forkJoin(promises).toPromise();
      })
      .then(() => {
        this.submitting = false;
        this.result = true;
        this.currentPage++;
      })
      .catch(error => {
        // TODO: abort other uploads? (all or none)
        alert('Uh-oh, error submitting comment');
        this.submitting = false;
        this.result = false;
      });
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
