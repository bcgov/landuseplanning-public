import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
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
import { ExternalLinkService } from 'app/services/externalLink.service';

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
    private tableTemplateUtils: TableTemplateUtils,
    private externalLinkService: ExternalLinkService
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
          const remote_api_path = window.localStorage.getItem('from_public_server--remote_api_path');
          this.pathAPI = (_.isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;

          if (data.projectAndBanner[0] && !this.project) {
            this.project = data.projectAndBanner[0];
            this._changeDetectionRef.detectChanges();
          }

          if (data.projectAndBanner[1] && !this.bannerImage) {
            const images = data.projectAndBanner[1][0].data.searchResults;

            if (images.length > 1) {
              // Make sure we're getting the latest image that has been assigned to this project
              const sortedImages = data.projectAndBanner[1][0].data.searchResults.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
              this.bannerImage = sortedImages[0];
            } else if (images.length === 1) {
              this.bannerImage = images[0];
            }
            
            if (this.bannerImage) {
              const safeName = this.bannerImage.documentFileName.replace(/ /g, '_');
              this.bannerImageSrc = `${this.pathAPI.replace('public', '')}/document/${this.bannerImage._id}/fetch/${safeName}`;
              this._changeDetectionRef.detectChanges();
            }
          }

          if (data.commentPeriod && !this.commentPeriod) {
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

            if (this.commentPeriod.relatedDocuments.length > 0 && !this.commentPeriodDocs) {
              forkJoin([this.documentService.getByMultiId(this.commentPeriod.relatedDocuments), this.externalLinkService.getByMultiId(this.commentPeriod.relatedDocuments)])
                .takeUntil(this.ngUnsubscribe)
                .subscribe(
                  data => {
                    this.commentPeriodDocs = [...data[0] || [], ...data[1] || []];
                    this._changeDetectionRef.detectChanges();
                  }
                );
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

  public goToItem(item) {
    // If we're opening an external link instead of a document, go straight to the predefined link
    if (item.externalLink) {
      window.open(item.externalLink);
    }
    // Otherwise, if it's a regular document, fetch it via the API
    let filename = item.documentFileName;
    let safeName = filename;
    try {
      safeName = encode(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_').replace(/\%2F/g, '_').replace(/\ /g, '_');
    } catch (e) {
      console.log('error:', e);
    }
    window.open(this.pathAPI.replace('public', '') + '/document/' + item._id + '/fetch/' + safeName, '_blank');
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
