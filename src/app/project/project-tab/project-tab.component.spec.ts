import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectTabComponent } from './project-tab.component';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'app/services/api';
import { Project } from 'app/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';

describe('ProjectTabComponent', () => {
  let component: ProjectTabComponent;
  let fixture: ComponentFixture<ProjectTabComponent>;
  const apiServiceStub = {
    getDocumentUrl() {
      return 'http://prc-api/documents/1/download';
    }
  };

  const existingProject = new Project();

  const validRouteData = {project: existingProject};

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);
  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ProjectTabComponent, NewlinesPipe],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when the project is retrievable from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData(validRouteData);
    });

    it('sets the component project to the one from the route', () => {
      expect(component.project).toEqual(existingProject);
    });
  });

  describe('when the project is not available from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData({something: 'went wrong'});
    });

    it('redirects to /projects', () => {
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
    });
  });
});
