import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjlistMapComponent } from './projlist-map.component';
import { ProjectService } from 'app/services/project.service';
import { ConfigService } from 'app/services/config.service';

describe('ProjlistMapComponent', () => {
  let component: ProjlistMapComponent;
  let fixture: ComponentFixture<ProjlistMapComponent>;

  // const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getProjects']);

  // const projectService = new ProjectService(
  //   apiServiceSpy,
  //   jasmine.createSpyObj('DocumentService', ['getAllByProjectId']),
  //   jasmine.createSpyObj('CommentPeriodService'),
  //   jasmine.createSpyObj('DecisionService', ['getAllByProjectId']),
  //   jasmine.createSpyObj('FeatureService', ['getAllByProjectId'])
  // );
  const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getAll']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjlistMapComponent],
      providers: [
        ConfigService,
        { provide: ProjectService, useValue: projectServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjlistMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
