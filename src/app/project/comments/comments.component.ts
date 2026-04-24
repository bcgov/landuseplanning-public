import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, Subject } from 'rxjs';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { isEmpty } from 'lodash';
import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { AddSurveyResponseComponent } from './add-survey-response/add-survey-response.component';
import { Project } from 'app/models/project';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { CommentsTableRowsComponent } from 'app/project/comments/comments-table-rows/comments-table-rows.component';
import { ExternalLinkService } from 'app/services/externalLink.service';
import { SearchService } from 'app/services/search.service';
import { ExternalLink } from 'app/models/externalLink';
import { Document } from 'app/models/document';
import { Utils } from 'app/shared/utils/utils';
import { SurveyService } from 'app/services/survey.service';
import { Survey } from 'app/models/survey';
import { ExternalLinkComponent } from './external-link/external-link.component';

type CommentPeriodFile = Document & ExternalLink;

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
    private route: ActivatedRoute,
    private commentService: CommentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private tableTemplateUtils: TableTemplateUtils,
    private externalLinkService: ExternalLinkService,
    private searchService: SearchService,
    private utils: Utils,
    public surveyService: SurveyService
  ) { }

  ngOnInit() {
    // Get page size and current page from url
    this.route.queryParams.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { commentPeriod: CommentPeriod, projectAndBanner }) => {
          const remote_api_path = window.localStorage.getItem('from_public_server--remote_api_path');
          this.pathAPI = (isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;

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
              this.bannerImageSrc = `${this.pathAPI.replace('/public', '')}/document/${this.bannerImage._id}/fetch/${safeName}`;
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
              const documentRequest = this.getFiles();
              const exLinkRequest = this.externalLinkService.getByMultiId(this.commentPeriod.relatedDocuments);
              forkJoin([documentRequest, exLinkRequest])
                .takeUntil(this.ngUnsubscribe)
                .subscribe(
                  (results) => {
                    this.commentPeriodDocs = [...results[0][0].data.searchResults || [], ...results[1] || []];
                    if (this.commentPeriodDocs) {
                      // Sort the documents by date added with most recent files first
                      this.commentPeriodDocs.sort((a: CommentPeriodFile, b: CommentPeriodFile) => {
                        const getDate = (item: CommentPeriodFile): number => {
                          const dateStr = 'datePosted' in item && item.datePosted ? item.datePosted : item.dateAdded;
                          return new Date(dateStr).getTime();
                        };
                        return getDate(b) - getDate(a);
                      });
                    }
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

  /**
   * Retrieves comment period documents
   *
   * @returns {Observable<Object>}
   */
  public getFiles = (): Observable<Object> => {
    const queryModifier = {
      documentSource: 'PROJECT',
      internalExt: 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt',
      _id: this.commentPeriod.relatedDocuments.toString()
    };
    return this.searchService.getSearchResults('', 'Document', [], 1, 100, '-dateAdded', queryModifier, true);
  };

  setCommentRowData() {
    this.commentTableData = new TableObject(
      CommentsTableRowsComponent,
      this.comments,
      this.tableParams
    );
  }

  setColumnSort(column: string) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedComments(this.tableParams.currentPage);
  }

  /**
   * Event handler for when a user clicks on a document
   *
   * @param item The item that's been clicked on, either a document or external link entry
   */
  public goToItem(item: CommentPeriodFile): void {
    // If we're opening an external link instead of a document, go straight to the predefined link
    if (item.externalLink) {
      window.open(item.externalLink);
    } else {
      // Otherwise, if it's a regular document, fetch it via the API
      let safeName = item.documentFileName;
      try {
        safeName = this.utils.encodeFileName(safeName);
      } catch (e) {
        console.log('error:', e);
      }
      window.open(this.pathAPI.replace('/public', '') + '/document/' + item._id + '/fetch/' + safeName, '_blank');
    }
  }

  public handleParticipate() {
    const method = this.project.commentPeriodForBanner?.commentingMethod;
    if (!method) {return; }
    switch (method) {
      case 'externalEngagementTool':
        this.openExternalLinkModal();
        break;
      case 'surveyTool':
        this.openSurveyModal();
        break;
      case 'basicForm':
        this.openCommentModal();
        break;
      default:
        console.error('Unknown commenting method:', method);
    }
  }

  public openExternalLinkModal() {
    const options = { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg', keyboard: false } as NgbModalOptions;
    this.ngbModal = this.modalService.open(ExternalLinkComponent, options);
    const instance = <ExternalLinkComponent>this.ngbModal.componentInstance as ExternalLinkComponent;
    instance.externalLinkText = this.project?.commentPeriodForBanner?.externalToolPopupText;
  }

  public openSurveyModal() {
    this.surveyService.getSelectedSurveyByCPId(this.project?.commentPeriodForBanner?._id)
      .subscribe((loadedSurvey: Survey) => {
        if (loadedSurvey) {
          const options = { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg', keyboard: false } as NgbModalOptions;
          this.ngbModal = this.modalService.open(AddSurveyResponseComponent, options);
          const instance = <AddSurveyResponseComponent>this.ngbModal.componentInstance as AddSurveyResponseComponent;
          instance.currentPeriod = this.project?.commentPeriodForBanner;
          instance.project = this.project;
          instance.survey = loadedSurvey;
        }
    });
  }

  public openCommentModal() {
    const options = { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg' } as NgbModalOptions;
    this.ngbModal = this.modalService.open(AddCommentComponent, options);
    const instance = <AddCommentComponent>this.ngbModal.componentInstance as AddCommentComponent;
    instance.currentPeriod = this.project?.commentPeriodForBanner;
    instance.project = this.project;
  }

  public goBackToProjectDetails() {
    this.router.navigate(['/p', this.project._id]);
  }

  getPaginatedComments(pageNumber: number) {
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
