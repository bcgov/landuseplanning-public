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
import { ActivatedRoute } from '@angular/router';

describe('DecisionsTabComponent', () => {
  let component: DecisionsTabComponent;
  let fixture: ComponentFixture<DecisionsTabComponent>;

  const existingApplication = new Application();
  const activatedRouteStub = {
    parent: {
      data: Observable.of({application: existingApplication}),
      snapshot: {}
    }
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
        { provide: ActivatedRoute, useValue: activatedRouteStub }
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
});
