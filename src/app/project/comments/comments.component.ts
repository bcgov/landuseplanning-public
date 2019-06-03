import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';

import { CommentService } from 'app/services/comment.service';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { Project } from 'app/models/project';
import { DocumentService } from 'app/services/document.service';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  public loading = true;
  public commentsLoading = true;

  public commentPeriod: CommentPeriod;
  public project: Project;
  public comments: Comment[];
  public commentPeriodDocs;

  public commentPeriodHeader: String;
  public currentPage = 1;
  public pageSize = 10;
  public totalComments = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private commentPeriodId = null;
  private ngbModal: NgbModalRef = null;

  public listType = 'comments';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private documentService: DocumentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
  ) { }

  ngOnInit() {
    // Get page size and current page from url
    this.route.queryParams.subscribe(params => {
      this.currentPage = Number(params['currentPage'] ? params['currentPage'] : 1);
      this.pageSize = Number(params['pageSize'] ? params['pageSize'] : 10);
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { commentPeriod: CommentPeriod, project: Project }) => {

          if (data.project) {
            this.project = data.project;
          }

          if (data.commentPeriod) {
            // To fix the issue where the last page is empty.
            this.commentPeriod = data.commentPeriod;
            if (this.commentPeriod.commentPeriodStatus === 'Closed') {
              this.commentPeriodHeader = 'Public Comment Period is Now Closed';
            } else if (this.commentPeriod.commentPeriodStatus === 'Pending') {
              this.commentPeriodHeader = 'Public Comment Period is Pending';
            } else if (this.commentPeriod.commentPeriodStatus === 'Open') {
              this.commentPeriodHeader = 'Public Comment Period is Now Open';
            }

            if (this.commentPeriod.relatedDocuments && this.commentPeriod.relatedDocuments.length > 0) {
              this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
                .takeUntil(this.ngUnsubscribe)
                .subscribe(docs => {
                  console.log(docs);
                  this.commentPeriodDocs = docs;
                  this._changeDetectionRef.detectChanges();
                });
            }

            this.loading = false;

            this.updateUrl();
            this.commentPeriodId = this.commentPeriod._id;
            this.getPaginatedComments(this.currentPage);
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  public getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.commentsLoading = true;
    this.commentService.getByPeriodId(this.commentPeriodId, pageNumber, this.pageSize, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        this.totalComments = data['totalCount'];
        this.currentPage = pageNumber;
        this.updateUrl();
        this.comments = data['currentComments'];
        this.commentsLoading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  updateUrl() {
    let currentUrl = this.router.url;
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    window.history.replaceState({}, '', currentUrl);
  }

  public downloadDocument(document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file(s)');
    });
  }

  public addComment() {
    if (this.commentPeriodId) {
      // open modal
      this.ngbModal = this.modalService.open(AddCommentComponent, { backdrop: 'static', size: 'lg' });
      // set input parameter
      (<AddCommentComponent>this.ngbModal.componentInstance).currentPeriod = this.commentPeriod;
      (<AddCommentComponent>this.ngbModal.componentInstance).project = this.project;
      // check result
      this.ngbModal.result.then(
        value => {
          // saved
          console.log(`Success, value = ${value}`);
        },
        reason => {
          // cancelled
          console.log(`Cancelled, reason = ${reason}`);
        }
      );
    }
  }

  public goBackToProjectDetails() {
    this.router.navigate(['/p', this.project._id]);
  }
}
