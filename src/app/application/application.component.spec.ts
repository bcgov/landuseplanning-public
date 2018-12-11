import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationComponent } from './application.component';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'app/services/config.service';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Application } from 'app/models/application';
import { ActivatedRoute } from '@angular/router';

describe('ApplicationComponent', () => {
  let component: ApplicationComponent;
  let fixture: ComponentFixture<ApplicationComponent>;

  const existingApplication = new Application();

  const activatedRouteStub = {
    data: Observable.of({application: existingApplication}),
    snapshot: {}
  };

  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);
  const commentPeriodService = new CommentPeriodService(
    apiServiceSpy
  );

  const applicationService = new ApplicationService(
    apiServiceSpy,
    jasmine.createSpyObj('DocumentService', ['getAllByApplicationId']),
    commentPeriodService,
    jasmine.createSpyObj('DecisionService', ['getAllByApplicationId']),
    jasmine.createSpyObj('FeatureService', ['getAllByApplicationId'])
  );


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationComponent, NewlinesPipe],
      imports: [RouterTestingModule, NgbModule.forRoot()],
      providers: [
        ConfigService,
        { provide: ApplicationService, useValue: applicationService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
