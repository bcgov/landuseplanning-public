import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsComponent } from './comments.component';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentService } from 'app/services/comment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { ExternalLinkService } from 'app/services/externalLink.service';
import { SearchService } from 'app/services/search.service';
import { Utils } from 'app/shared/utils/utils';
import { SurveyService } from 'app/services/survey.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { Project } from 'app/models/project';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

const tableParams = new TableParamsObject();
tableParams.currentPage = 1;
tableParams.pageSize = 10;

const activatedRouteStub = {
  params: of({}),
  data: of({
    commentPeriod: new CommentPeriod({ _id: 'cp-1', relatedDocuments: [] }),
    projectAndBanner: [
      new Project({ _id: 'proj-1', engagementLabel: 'Engagement' }),
      [{ data: { searchResults: [] } }]
    ]
  })
} as Partial<ActivatedRoute>;

const commentServiceStub = {
  getByPeriodId: () => of({ currentComments: [], totalCount: 0 })
} as Partial<CommentService>;

const modalServiceStub = {
  open: jasmine.createSpy('open').and.returnValue({ componentInstance: {} })
} as Partial<NgbModal>;

const tableTemplateUtilsStub = {
  getParamsFromUrl: () => tableParams,
  updateTableParams: () => tableParams,
  updateUrl: () => {}
} as Partial<TableTemplateUtils>;

const externalLinkServiceStub = {
  getByMultiId: () => of([])
} as Partial<ExternalLinkService>;

const searchServiceStub = {
  getSearchResults: () => of([{ data: { searchResults: [] } }])
} as Partial<SearchService>;

const utilsStub = {
  encodeFileName: (value: string) => value
} as Partial<Utils>;

const surveyServiceStub = {
  getSelectedSurveyByCPId: () => of(null)
} as Partial<SurveyService>;

const routerStub = {
  navigate: jasmine.createSpy('navigate')
} as Partial<Router>;

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: CommentService, useValue: commentServiceStub },
        { provide: NgbModal, useValue: modalServiceStub },
        { provide: TableTemplateUtils, useValue: tableTemplateUtilsStub },
        { provide: ExternalLinkService, useValue: externalLinkServiceStub },
        { provide: SearchService, useValue: searchServiceStub },
        { provide: Utils, useValue: utilsStub },
        { provide: SurveyService, useValue: surveyServiceStub },
        { provide: Router, useValue: routerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    component.project = new Project({ _id: 'proj-1', engagementLabel: 'Engagement' });
    component.commentPeriod = new CommentPeriod({ _id: 'cp-1', relatedDocuments: [] });
    window.localStorage.setItem('from_public_server--remote_api_path', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
