import { Component, Input, HostListener, OnInit } from '@angular/core';
// import { HttpEventType } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogService } from 'ng2-bootstrap-modal';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  templateUrl: './comment-modal.component.html',
  styleUrls: ['./comment-modal.component.scss']
})
export class CommentModalComponent implements OnInit {
  @Input() currentPeriod: CommentPeriod; // for the subject application

  public submitting = false;
  public progressValue: number; // used in template
  public progressBufferValue: number; // used in template
  public totalSize: number;
  public currentPage = 1;
  private comment: Comment;
  public files: File[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private dialogService: DialogService,
    private commentService: CommentService,
    private documentService: DocumentService
  ) {}

  // check for unsaved changes before closing (or reloading) current tab/window
  @HostListener('window:beforeunload', ['$event'])
  public handleBeforeUnload(event: Event) {
    // console.log('handleBeforeUnload()');

    // display browser alert if needed
    if (this.anyUnsavedData()) {
      event.returnValue = true;
    }
  }

  public dismiss(reason: string) {
    if (this.currentPage < 4 && this.anyUnsavedData()) {
      // prompt to confirm
      this.dialogService
        .addDialog(
          ConfirmComponent,
          {
            title: 'Are you sure?',
            message: 'You are about to discard your comment. Do you want to continue?'
          },
          {
            backdropColor: 'rgba(0, 0, 0, 0.5)'
          }
        )
        .subscribe(isConfirmed => {
          // dismiss if confirmed
          if (isConfirmed) {
            this.activeModal.dismiss(reason);
          }
        });
    } else {
      // dismiss right away
      this.activeModal.dismiss(reason);
    }
  }

  private anyUnsavedData(): boolean {
    return this.comment.hasData() || this.files.length > 0;
  }

  ngOnInit() {
    this.comment = new Comment({ _commentPeriod: this.currentPeriod._id });
  }

  public p1_next() {
    this.currentPage++;
  }

  public p2_back() {
    this.currentPage--;
  }

  public p2_next() {
    this.currentPage++;
  }

  public p3_back() {
    this.currentPage--;
  }

  public p3_next() {
    this.submitting = true;
    this.progressValue = this.progressBufferValue = 0;

    // approximate size of everything for progress reporting
    const commentSize = this.sizeof(this.comment);
    this.totalSize = commentSize;
    this.files.forEach(file => (this.totalSize += file.size));

    // first add new comment
    this.progressBufferValue += (100 * commentSize) / this.totalSize;
    this.commentService
      .add(this.comment)
      .toPromise()
      .then((comment: Comment) => {
        this.progressValue += (100 * commentSize) / this.totalSize;
        this.comment = comment;
        return comment;
      })
      .then(() => {
        // then upload all documents
        const observables: Array<Observable<Document>> = [];

        this.files.forEach(file => {
          const formData = new FormData();
          formData.append('_comment', this.comment._id);
          formData.append('displayName', file.name);
          formData.append('upfile', file);
          this.progressBufferValue += (100 * file.size) / this.totalSize;

          // TODO: improve progress bar by listening to progress events
          // see https://stackoverflow.com/questions/37158928/angular-2-http-progress-bar
          // see https://angular.io/guide/http#listening-to-progress-events
          observables.push(
            this.documentService.add(formData).pipe(
              map((document: Document) => {
                this.progressValue += (100 * file.size) / this.totalSize;
                return document;
              })
            )
            // .subscribe((event: HttpEventType) => {
            //   if (event.type === HttpEventType.UploadProgress) {
            //     // TODO: do something here
            //   }
            // })
          );
        });

        // execute all uploads in parallel
        return forkJoin(observables).toPromise();
      })
      .then(() => {
        this.submitting = false;
        this.currentPage++;
      })
      .catch(() => {
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
        case 'boolean':
          bytes += 4;
          break;
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += 2 * obj.length;
          break;
        case 'object':
          if (obj) {
            bytes += this.sizeof(obj);
          }
          break;
      }
    });
    return bytes;
  }
}
