import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionsTabComponent } from './decisions-tab.component';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { VarDirective } from 'app/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Application } from 'app/models/application';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';

describe('DecisionsTabComponent', () => {
  let component: DecisionsTabComponent;
  let fixture: ComponentFixture<DecisionsTabComponent>;

  const existingApplication = new Application();
  const validRouteData = {application: existingApplication};

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);
  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const apiServiceStub = {
    getDocumentUrl() {
      return 'http://prc-api/documents/1/download';
    }
  };

  const applicationServiceStub = {
    getStatusCode() {
      return 'AC';
    },
    isDecision() {
      return true;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DecisionsTabComponent,
        NewlinesPipe,
        VarDirective
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: ApplicationService, useValue: applicationServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when the application is retrievable from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData(validRouteData);
    });

    it('sets the component application to the one from the route', () => {
      expect(component.application).toEqual(existingApplication);
    });
  });

  describe('when the application is not available from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData({something: 'went wrong'});
    });

    it('redirects to /applications', () => {
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/applications']);
    });
  });
});
