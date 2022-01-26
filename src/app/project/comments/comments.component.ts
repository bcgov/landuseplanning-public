import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';

import { CommentService } from 'app/services/comment.service';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { AddSurveyResponseComponent } from './add-survey-response/add-survey-response.component';
import { Project } from 'app/models/project';
import { DocumentService } from 'app/services/document.service';
import { ApiService } from 'app/services/api';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { CommentsTableRowsComponent } from 'app/project/comments/comments-table-rows/comments-table-rows.component';

const encode = encodeURIComponent;
window['encodeURIComponent'] = (component: string) => {
  return encode(component).replace(/[!'()*]/g, (c) => {
    // Also encode !, ', (, ), and *
    return '%' + c.charCodeAt(0).toString(16);
  });
};

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, OnDestroy {
  public loading = true;
  public commentsLoading = true;

  public commentPeriod: CommentPeriod;
  public project: Project;
  public comments: Comment[];
  public commentPeriodDocs;
  public bannerImage;
  public bannerImageSrc: string;
  public pathAPI: string;

  public commentTableData: TableObject;
  public commentPeriodHeader: String;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private commentPeriodId = null;
  private ngbModal: NgbModalRef = null;

  public tableParams: TableParamsObject = new TableParamsObject();

  public commentTableColumns = [];


  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private documentService: DocumentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private tableTemplateUtils: TableTemplateUtils
  ) { }

  ngOnInit() {
    // Get page size and current page from url
    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { commentPeriod: CommentPeriod, projectAndBanner }) => {

          if (data.projectAndBanner[0]) {
            this.project = data.projectAndBanner[0];
          }

          if (data.projectAndBanner[1]) {
            this.bannerImage = data.projectAndBanner[1][0].data.searchResults[0];
          }

          // The following items are loaded by a file that is only present on cluster builds.
          // Locally, this will be empty and local defaults will be used.
          const remote_api_path = window.localStorage.getItem('from_public_server--remote_api_path');
          this.pathAPI = (_.isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;


          if (this.bannerImage) {
            const safeName = this.bannerImage.documentFileName.replace(/ /g, '_');
            this.bannerImageSrc = `${this.pathAPI}/document/${this.bannerImage._id}/fetch/${safeName}`;
            console.log('this banner', this.bannerImageSrc)
          }

          if (data.commentPeriod) {
            // To fix the issue where the last page is empty.
            this.commentPeriod = data.commentPeriod;
            const engagementLabel = this.project.engagementLabel ? this.project.engagementLabel : 'Public Comment Period';
            if (this.commentPeriod.commentPeriodStatus === 'Closed') {
              this.commentPeriodHeader = `${engagementLabel} is now closed`;
            } else if (this.commentPeriod.commentPeriodStatus === 'Pending') {
              this.commentPeriodHeader = `${engagementLabel} is pending`;
            } else if (this.commentPeriod.commentPeriodStatus === 'Open') {
              this.commentPeriodHeader = `${engagementLabel} is now open`;
            }

            if (this.commentPeriod.relatedDocuments && this.commentPeriod.relatedDocuments.length > 0) {
              this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
                .takeUntil(this.ngUnsubscribe)
                .subscribe(docs => {
                  this.commentPeriodDocs = docs;
                  this._changeDetectionRef.detectChanges();
                });
            }
            this.commentPeriodId = this.commentPeriod._id;
            this.commentService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, true)
              .takeUntil(this.ngUnsubscribe)
              .subscribe((res: any) => {
                this.comments = res.currentComments;
                this.tableParams.totalListItems = res.totalCount;
                this.commentTableColumns = [
                  {
                    name: `Showing ${this.comments.length} comments out of ${this.tableParams.totalListItems}:`,
                    value: 'comment',
                    width: 'no-sort',
                    nosort: true
                  },
                ];
                this.setCommentRowData();

                this.loading = false;
                this._changeDetectionRef.detectChanges();
              });

          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }


  setCommentRowData() {
    this.commentTableData = new TableObject(
      CommentsTableRowsComponent,
      this.comments,
      this.tableParams
    );
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedComments(this.tableParams.currentPage);
  }

  public getBannerURL() {
    return this.bannerImageSrc ? `url(${this.bannerImageSrc})` : '';
  }

  // public downloadDocument(document) {
  //   return this.api.downloadDocument(document).then(() => {
  //     console.log('Download initiated for file(s)');
  //   });
  // }

  public goToItem(item) {
    let filename = item.documentFileName;
    let safeName = filename;
    try {
      safeName = encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_').replace(/\%2F/g, '_');
    } catch (e) {
      console.log('error:', e);
    }
    window.open('/api/document/' + item._id + '/fetch/' + safeName, '_blank');
  }

  public addComment() {

    if (this.commentPeriod.surveySelected) {

      // open modal
      this.ngbModal = this.modalService.open(AddSurveyResponseComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static',   size: 'xl' as 'lg', windowClass: 'comment-modal' });
      // set input parameter
      (<AddSurveyResponseComponent>this.ngbModal.componentInstance).currentPeriod = this.commentPeriod;
      (<AddSurveyResponseComponent>this.ngbModal.componentInstance).project = this.project;
      (<AddSurveyResponseComponent>this.ngbModal.componentInstance).survey = this.commentPeriod.surveySelected;

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
    } else if (this.commentPeriodId) {
      // open modal
      this.ngbModal = this.modalService.open(AddCommentComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg' });
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

  getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    // window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.commentService.getByPeriodId(this.commentPeriodId, this.tableParams.currentPage, this.tableParams.pageSize, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.comments = res.currentComments;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setCommentRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  projectFieldType(fieldType) {
    return typeof fieldType;
  }

  makeAriaLabel(projName) {
    let projPhrase;
    projName ? projPhrase = `the ${projName} project` : projPhrase = `this project's`;
    return `Submit a comment to ${projPhrase} comment period.`;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
