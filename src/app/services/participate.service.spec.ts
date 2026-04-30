import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ParticipateService } from './participate.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SurveyService } from './survey.service';
import { of } from 'rxjs';

import { ExternalLinkComponent } from 'app/project/comments/external-link/external-link.component';
import { AddSurveyResponseComponent } from 'app/project/comments/add-survey-response/add-survey-response.component';
import { AddCommentComponent } from 'app/project/comments/add-comment/add-comment.component';

describe('ParticipateService', () => {
  let service: ParticipateService;
  let modalService: jasmine.SpyObj<NgbModal>;
  let surveyService: jasmine.SpyObj<SurveyService>;
  let mockModalRef: any;

  beforeEach(() => {
    modalService = jasmine.createSpyObj('NgbModal', ['open']);
    surveyService = jasmine.createSpyObj('SurveyService', ['getSelectedSurveyByCPId']);

    mockModalRef = {
      componentInstance: {}
    };

    modalService.open.and.returnValue(mockModalRef);

    TestBed.configureTestingModule({
      providers: [
        ParticipateService,
        { provide: NgbModal, useValue: modalService },
        { provide: SurveyService, useValue: surveyService }
      ]
    });

    service = TestBed.inject(ParticipateService);
  });

  afterEach(() => {
    modalService.open.calls.reset();
    surveyService.getSelectedSurveyByCPId.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('opens ExternalLinkComponent for externalEngagementTool', fakeAsync(() => {
    const project: any = {
      commentPeriodForBanner: {
        commentingMethod: 'externalEngagementTool',
        externalToolPopupText: 'text',
        externalToolPopupURL: 'url'
      }
    };

    service.handleParticipate(project);
    tick();

    expect(modalService.open).toHaveBeenCalledTimes(1);
    expect(modalService.open).toHaveBeenCalledWith(
      ExternalLinkComponent,
      jasmine.any(Object)
    );
  }));

  it('opens AddSurveyResponseComponent when survey exists', fakeAsync(() => {
    const mockSurvey = { _id: 'survey1' };
    surveyService.getSelectedSurveyByCPId.and.returnValue(of(mockSurvey));

    const project: any = {
      commentPeriodForBanner: {
        commentingMethod: 'surveyTool',
        _id: 'cp1'
      }
    };

    service.handleParticipate(project);
    tick();

    expect(surveyService.getSelectedSurveyByCPId).toHaveBeenCalledWith('cp1');
    expect(modalService.open).toHaveBeenCalledTimes(1);
    expect(modalService.open).toHaveBeenCalledWith(
      AddSurveyResponseComponent,
      jasmine.any(Object)
    );
  }));

  it('does nothing if no survey is returned', fakeAsync(() => {
    surveyService.getSelectedSurveyByCPId.and.returnValue(of(null));

    const project: any = {
      commentPeriodForBanner: {
        commentingMethod: 'surveyTool',
        _id: 'cp1'
      }
    };

    service.handleParticipate(project);
    tick();

    expect(surveyService.getSelectedSurveyByCPId).toHaveBeenCalledWith('cp1');
    expect(modalService.open).not.toHaveBeenCalled();
  }));

  it('opens AddCommentComponent for basicForm', fakeAsync(() => {
    const project: any = {
      commentPeriodForBanner: {
        commentingMethod: 'basicForm'
      }
    };

    service.handleParticipate(project);
    tick();

    expect(modalService.open).toHaveBeenCalledTimes(1);
    expect(modalService.open).toHaveBeenCalledWith(
      AddCommentComponent,
      jasmine.any(Object)
    );
  }));

  it('does nothing if method is missing', fakeAsync(() => {
    const project: any = {
      commentPeriodForBanner: {}
    };

    service.handleParticipate(project);
    tick();

    expect(modalService.open).not.toHaveBeenCalled();
  }));

  it('logs error for unknown method', fakeAsync(() => {
    spyOn(console, 'error');

    const project: any = {
      commentPeriodForBanner: {
        commentingMethod: 'unknownMethod'
      }
    };

    service.handleParticipate(project);
    tick();

    expect(console.error).toHaveBeenCalled();
    expect(modalService.open).not.toHaveBeenCalled();
  }));
});
