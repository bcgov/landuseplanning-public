import { Component, OnInit, Renderer2, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Project, ProjectLogo, ProjectLogoWithSource } from 'app/models/project';
import { Document } from 'app/models/document';
import { Survey } from 'app/models/survey';
import { CommentPeriod } from 'app/models/commentperiod';

import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { SurveyService } from 'app/services/survey.service';
import { StorageService } from 'app/services/storage.service';
import { AddCommentComponent } from './comments/add-comment/add-comment.component';
import { AddSurveyResponseComponent } from './comments/add-survey-response/add-survey-response.component';
import { EmailSubscribeComponent } from './email-subscribe/email-subscribe.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly tabLinks = [
    { label: 'Project Details', link: 'project-details' },
    { label: 'Background', link: 'background-info' },
    { label: 'Engagement', link: 'commenting' },
    { label: 'Documents', link: 'documents' },
    { label: 'Project Phase', link: 'project-phase' },
  ];

  public project: Project = null;
  public projectLogosWithSource: ProjectLogoWithSource[];
  public period: CommentPeriod = null;
  public appHeader: HTMLHeadingElement;
  private ngbModal: NgbModalRef = null;
  public surveySelected: Survey;
  public bannerImage;
  public bannerImageSrc: string;
  public pathAPI: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router,
    private modalService: NgbModal,
    private _changeDetectionRef: ChangeDetectorRef,
    private renderer: Renderer2,
    public configService: ConfigService,
    public projectService: ProjectService, // used in template
    public commentPeriodService: CommentPeriodService, // used in template
    public surveyService: SurveyService
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => {
          if (data.projectAndBanner) {
            this.project = data.projectAndBanner[0];
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            this.renderer.removeClass(document.body, 'no-scroll');
            this.bannerImage = data.projectAndBanner[1][0].data.searchResults[0];
            // The following items are loaded by a file that is only present on cluster builds.
            // Locally, this will be empty and local defaults will be used.
            const remote_api_path = window.localStorage.getItem('from_public_server--remote_api_base_path');
            this.pathAPI = (_.isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;

            if (this.bannerImage) {
              this.bannerImageSrc = this.getFileSourceUrl(this.bannerImage);
            }

            if (this.project.logos.length) {
              this.projectLogosWithSource = this.project.logos.map(logo => {
                return {
                  document: logo.document,
                  name: logo.name,
                  alt: logo.alt,
                  link: logo.link,
                  source: this.getFileSourceUrl(logo)
                }
              })
            }
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load the project');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  ngAfterViewInit() {
    this.appHeader = document.getElementsByTagName('h1')[0];
    if ( this.appHeader ) {
      this.appHeader.focus();
    }
  }

  public getBannerURL() {
    return this.bannerImageSrc ? `url(${this.bannerImageSrc})` : '';
  }

  /**
   * Get a URL of where the file can be found so it can be used as an
   * image source tag, background url, etc.
   *
   * @param file File to get the URL for.
   * @returns The URL of the file.
   */
  private getFileSourceUrl(file: Document | ProjectLogo): string {
    let sourceUrl;
    if ('_id' in file) {
      sourceUrl = `${this.pathAPI}/document/${file._id}/fetch/${file.documentFileName.replace(/ /g, '_')}`;
    } else {
      sourceUrl = `${this.pathAPI}/document/${file.document}/fetch/${file.name.replace(/ /g, '_')}`;
    }
    return sourceUrl;
  }

  public addComment() {
    if (this.project.commentPeriodForBanner) {
        this.surveyService.getSelectedSurveyByCPId(this.project.commentPeriodForBanner._id)
        .subscribe((loadedSurvey: Survey) => {
          console.log('survey', loadedSurvey)
          if (loadedSurvey) {

          // open modal
          this.ngbModal = this.modalService.open(AddSurveyResponseComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg', keyboard: false });
          // set input parameter
          (<AddSurveyResponseComponent>this.ngbModal.componentInstance).currentPeriod = this.project.commentPeriodForBanner;
          (<AddSurveyResponseComponent>this.ngbModal.componentInstance).project = this.project;
          (<AddSurveyResponseComponent>this.ngbModal.componentInstance).survey = loadedSurvey;

        } else {

          // open modal
          this.ngbModal = this.modalService.open(AddCommentComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg' });
          // set input parameter
          (<AddCommentComponent>this.ngbModal.componentInstance).currentPeriod = this.project.commentPeriodForBanner;
          (<AddCommentComponent>this.ngbModal.componentInstance).project = this.project;
        }
      })

    }
  }

  public addEmail() {
      // open modal
      this.ngbModal = this.modalService.open(EmailSubscribeComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg' });
      // set input parameter
    (<EmailSubscribeComponent>this.ngbModal.componentInstance).project = this.project;
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

  CPActionAriaLabel(projName, action) {
    let projPhrase;
    let actionPhrases = {
      submit: 'Submit a comment to',
      view: 'View more details about'
    }
    projName ? projPhrase = `the ${projName} project` : projPhrase = `this project's`
    return `${actionPhrases[action]} ${projPhrase} comment period.`;
  }

  makeViewDetailsAriaLabel(projName) {
    if (projName) {
      return `View more details about the ${projName} project comment period.`;
    } else {
      return `View more details about this project's comment period.`;
    }
  }

  makeSubmitCommentAriaLabel(projName) {
    if (projName) {
      return `Submit a comment to the ${projName} project comment period.`;
    } else {
      return `Submit a comment this project's comment period.`;
    }
  }

  public projectFieldType(fieldType) {
    return typeof fieldType;
  }


  public goToViewComments() {
    this.router.navigate(['/p', this.project._id, 'cp', this.project.commentPeriodForBanner._id, 'details']);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
