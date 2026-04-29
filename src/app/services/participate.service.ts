import { Injectable, Type } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SurveyService } from './survey.service';
import { Project } from 'app/models/project';
import { ExternalLinkComponent } from 'app/project/comments/external-link/external-link.component';
import { AddSurveyResponseComponent } from 'app/project/comments/add-survey-response/add-survey-response.component';
import { AddCommentComponent } from 'app/project/comments/add-comment/add-comment.component';

@Injectable({ providedIn: 'root' })
export class ParticipateService {
  constructor(
    private modalService: NgbModal,
    private surveyService: SurveyService
  ) {}

  async handleParticipate(project: Project) {
    const method = project.commentPeriodForBanner?.commentingMethod;
    if (!method) {return};

    const baseOptions: NgbModalOptions = {
      ariaLabelledBy: 'modal-instructions',
      backdrop: 'static',
      size: 'xl',
      keyboard: false
    };

    let options = baseOptions;
    let data: any;
    let component: Type<any>;

    switch (method) {
      case 'externalEngagementTool':
        data = {
          externalToolPopupText: project?.commentPeriodForBanner?.externalToolPopupText,
          externalToolPopupURL: project?.commentPeriodForBanner?.externalToolPopupURL
        };
        component = ExternalLinkComponent;
        break;

      case 'surveyTool': {
        const survey = await this.surveyService
          .getSelectedSurveyByCPId(project?.commentPeriodForBanner?._id)
          .toPromise();

        if (!survey) {return};

        data = {
          currentPeriod: project?.commentPeriodForBanner,
          project,
          survey
        };
        component = AddSurveyResponseComponent;
        break;
      }

      case 'basicForm':
        options = { ...baseOptions, keyboard: undefined };
        data = {
          currentPeriod: project?.commentPeriodForBanner,
          project
        };
        component = AddCommentComponent;
        break;

      default:
        console.error('Unknown commenting method:', method);
        return;
    }

    const modalRef = this.modalService.open(component, options);
    Object.assign(modalRef.componentInstance, data);
    return modalRef;
  }
}
