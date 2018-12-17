import { Component, Input, OnInit } from '@angular/core';
// import { HttpEventType } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

export class AddCommentComponent implements OnInit {
  @Input() currentPeriod: CommentPeriod;

  public submitting = false;
  private progressValue: number;
  private progressBufferValue: number;
  public totalSize: number;
  public currentPage = 1;
  private comment: Comment;
  public files: Array<File> = [];

  constructor(
    public activeModal: NgbActiveModal,
    private commentService: CommentService,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.comment = new Comment();
    this.comment._commentPeriod = this.currentPeriod._id;
    this.comment.commentAuthor.requestedAnonymous = false;
  }

  private p1_next() {
    this.currentPage++;
  }

  private p2_back() {
    this.currentPage--;
  }

  private p2_next() {
    this.currentPage++;
  }

  private p3_back() {
    this.currentPage--;
  }

  private p3_next() {
    this.submitting = true;
    this.progressValue = this.progressBufferValue = 0;

    // approximate size of everything for progress reporting
    const commentSize = this.sizeof(this.comment);
    this.totalSize = commentSize;
    this.files.forEach(file => this.totalSize += file.size);

    // first add new comment
    this.progressBufferValue += 100 * commentSize / this.totalSize;
    this.commentService.add(this.comment)
      .toPromise()
      .then((comment: Comment) => {
        this.progressValue += 100 * commentSize / this.totalSize;
        this.comment = comment;
        return comment;
      })
      .then((comment: Comment) => {
        // then upload all documents
        const observables: Array<Observable<Document>> = [];

        this.files.forEach(file => {
          const formData = new FormData();
          formData.append('_comment', this.comment._id);
          formData.append('displayName', file.name);
          formData.append('upfile', file);
          this.progressBufferValue += 100 * file.size / this.totalSize;

          // TODO: improve progress bar by listening to progress events
          // see https://stackoverflow.com/questions/37158928/angular-2-http-progress-bar
          // see https://angular.io/guide/http#listening-to-progress-events
          observables.push(this.documentService.add(formData)
            .map((document: Document) => {
              this.progressValue += 100 * file.size / this.totalSize;
              return document;
            })
            // .subscribe((event: HttpEventType) => {
            //   if (event.type === HttpEventType.UploadProgress) {
            //     // TODO: do something here
            //   }
            // })
          );
        });

        // execute all uploads in parallel
        return Observable.forkJoin(observables).toPromise();
      })
      .then(() => {
        this.submitting = false;
        this.currentPage++;
      })
      .catch(error => {
        alert('Uh-oh, error submitting comment');
        this.submitting = false;
      });
  }

  // approximate size (keys + data)
  private sizeof(o: object) {
    let bytes = 0;

    Object.keys(o).forEach(key => {
      bytes += key.length;
      const obj = o[key];
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
