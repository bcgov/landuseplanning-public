import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectComponent } from './project.component';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Project } from 'app/models/project';
import { ActivatedRoute } from '@angular/router';

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;

  const existingProject = new Project();

  const activatedRouteStub = {
    data: Observable.of({project: existingProject}),
    snapshot: {}
  };

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
      declarations: [ProjectComponent, NewlinesPipe],
      imports: [RouterTestingModule, NgbModule.forRoot()],
      providers: [
        ConfigService,
        { provide: ProjectService, useValue: projectService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
