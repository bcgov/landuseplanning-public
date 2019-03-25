import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FindPanelComponent } from './find-panel.component';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VarDirective } from 'app/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

describe('FindPanelComponent', () => {
  let component: FindPanelComponent;
  let fixture: ComponentFixture<FindPanelComponent>;

  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);
  const commentPeriodService = new CommentPeriodService(apiServiceSpy);

  const applicationService = new ApplicationService(
    apiServiceSpy,
    jasmine.createSpyObj('DocumentService', ['getAllByApplicationId']),
    commentPeriodService,
    jasmine.createSpyObj('DecisionService', ['getAllByApplicationId']),
    jasmine.createSpyObj('FeatureService', ['getAllByApplicationId'])
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FindPanelComponent, VarDirective],
      imports: [NgbModule, FormsModule, RouterTestingModule],
      providers: [
        NgbTypeaheadConfig,
        { provide: ApplicationService, useValue: applicationService },
        { provide: CommentPeriodService, useValue: commentPeriodService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
