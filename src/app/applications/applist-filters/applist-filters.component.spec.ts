import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplistFiltersComponent } from './applist-filters.component';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VarDirective } from 'app/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';

describe('ApplistFiltersComponent', () => {
  let component: ApplistFiltersComponent;
  let fixture: ComponentFixture<ApplistFiltersComponent>;

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
      declarations: [ApplistFiltersComponent, VarDirective],
      imports: [
        NgbModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        NgbTypeaheadConfig,
        ConfigService,
        { provide: ApplicationService, useValue: applicationService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplistFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
