import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import { Project } from 'app/models/project';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { SurveyService } from 'app/services/survey.service';
import { Survey } from 'app/models/survey';
import { AddSurveyResponseComponent } from '../comments/add-survey-response/add-survey-response.component';
import { AddCommentComponent } from '../comments/add-comment/add-comment.component';

@Component({
  templateUrl: './commenting-tab.component.html',
  styleUrls: ['./commenting-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
export class CommentingTabComponent implements OnInit, OnDestroy {
  public currentProject: Project = null;
  public loading = true;
  public commentPeriods: Array<CommentPeriod> = [];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private ngbModal: NgbModalRef = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private _changeDetectionRef: ChangeDetectorRef,
    public commentPeriodService: CommentPeriodService, // used in template
    public surveyService: SurveyService,
  ) { }

  ngOnInit() {
    // get project
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data) => {
          if (data.projectAndBanner[0]) {
            this.currentProject = data.projectAndBanner[0];
            this.getCommentPeriods(data.projectAndBanner[0]._id);
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        }
      );
  }

  goToCP(commentPeriod) {
    this.router.navigate(['p', this.currentProject._id, 'cp', commentPeriod._id]);
  }

  getCommentPeriods(projectId: string) {
    this.commentPeriodService.getAllByProjectId(projectId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res.data) {
          this.commentPeriods = res.data;
        }
      });
  }

  public addComment() {
    if (this.currentProject.commentPeriodForBanner) {
      this.surveyService.getSelectedSurveyByCPId(this.currentProject.commentPeriodForBanner._id)
        .subscribe((loadedSurvey: Survey) => {
          if (loadedSurvey) {
            // open modal
            this.ngbModal = this.modalService.open(AddSurveyResponseComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg', keyboard: false });
            // set input parameter
            (<AddSurveyResponseComponent>this.ngbModal.componentInstance).currentPeriod = this.currentProject.commentPeriodForBanner;
            (<AddSurveyResponseComponent>this.ngbModal.componentInstance).project = this.currentProject;
            (<AddSurveyResponseComponent>this.ngbModal.componentInstance).survey = loadedSurvey;
          } else {
            // open modal
            this.ngbModal = this.modalService.open(AddCommentComponent, { ariaLabelledBy: 'modal-instructions', backdrop: 'static', size: 'xl' as 'lg' });
            // set input parameter
            (<AddCommentComponent>this.ngbModal.componentInstance).currentPeriod = this.currentProject.commentPeriodForBanner;
            (<AddCommentComponent>this.ngbModal.componentInstance).project = this.currentProject;
          }
      })
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
