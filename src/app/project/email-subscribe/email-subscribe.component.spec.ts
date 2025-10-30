import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailSubscribeComponent } from './email-subscribe.component';
import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';
import { of } from 'rxjs';
import { Project } from 'app/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmailSubscribe } from 'app/models/emailSubscribe';

describe('EmailSubscribeComponent', () => {
  let component: EmailSubscribeComponent;
  let fixture: ComponentFixture<EmailSubscribeComponent>;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  const existingProject = new Project();
  const validRouteData = { project: existingProject };

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);

  const apiServiceStub = {
    getDocumentUrl() {
      return 'http://prc-api/documents/1/download';
    }
  };

  const projectServiceStub = {
    getStatusCode() {
      return 'AC';
    },
    isDecision() {
      return true;
    }
  };

  const emailSubscribeServiceStub = {
    add: () => of(new EmailSubscribe({ _id: 'es-1' }))
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EmailSubscribeComponent,
        NewlinesPipe,
        VarDirective
      ],
      imports: [RouterTestingModule, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: EmailSubscribeService, useValue: emailSubscribeServiceStub },
        NgbActiveModal
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSubscribeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');
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
      activatedRouteStub.setParentData({ something: 'went wrong' });
      component.project = null;
    });

    it('redirects to /projects', () => {
      navigateSpy.calls.reset();
      component.ngOnInit();
      expect(navigateSpy).toHaveBeenCalledWith(['/projects']);
    });
  });
});
