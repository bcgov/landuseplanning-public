import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { AddSurveyResponseComponent } from './add-survey-response.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Utils } from 'app/shared/utils/utils';
import { SurveyResponseService } from 'app/services/surveyResponse.service';
import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import { DocumentService } from 'app/services/document.service';
import { ConfigService } from 'app/services/config.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { Project } from 'app/models/project';
import { Survey } from 'app/models/survey';
import { SurveyResponse } from 'app/models/surveyResponse';
import { Document } from 'app/models/document';

describe('AddSurveyResponseComponent', () => {
  let component: AddSurveyResponseComponent;
  let fixture: ComponentFixture<AddSurveyResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddSurveyResponseComponent],
      imports: [ReactiveFormsModule, MatProgressBarModule],
      providers: [
        NgbActiveModal,
        { provide: Utils, useValue: { numToWord: () => 'one' } },
        { provide: SurveyResponseService, useValue: { add: () => of(new SurveyResponse({ _id: '1' })) } },
        SurveyBuilderService,
        { provide: DocumentService, useValue: { add: () => of(new Document({})) } },
        { provide: ConfigService, useValue: { lists: [{ searchResults: [] }] } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSurveyResponseComponent);
    component = fixture.componentInstance;
    component.currentPeriod = new CommentPeriod({ _id: 'cp-1' });
    component.project = new Project({ _id: 'proj-1' });
    component.survey = new Survey({
      _id: 'survey-1',
      questions: [
        { type: 'info' },
        { type: 'smallText', answerRequired: false }
      ]
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
