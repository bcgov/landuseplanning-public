import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjlistFiltersComponent } from './projlist-filters.component';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';

describe('ProjlistFiltersComponent', () => {
  let component: ProjlistFiltersComponent;
  let fixture: ComponentFixture<ProjlistFiltersComponent>;

  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProjects']);
  const commentPeriodService = new CommentPeriodService(
    apiServiceSpy
  );

  const projectService = new ProjectService(
    apiServiceSpy,
    jasmine.createSpyObj('DocumentService', ['getAllByProjectId']),
    commentPeriodService,
    jasmine.createSpyObj('DecisionService', ['getAllByProjectId']),
    jasmine.createSpyObj('FeatureService', ['getAllByProjectId'])
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjlistFiltersComponent, VarDirective],
      imports: [
        NgbModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        NgbTypeaheadConfig,
        ConfigService,
        { provide: ProjectService, useValue: projectService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjlistFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});