import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMapComponent } from './app-map.component';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';

describe('AppMapComponent', () => {
  let component: AppMapComponent;
  let fixture: ComponentFixture<AppMapComponent>;

  // const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);

  // const applicationService = new ApplicationService(
  //   apiServiceSpy,
  //   jasmine.createSpyObj('DocumentService', ['getAllByApplicationId']),
  //   jasmine.createSpyObj('CommentPeriodService'),
  //   jasmine.createSpyObj('DecisionService', ['getAllByApplicationId']),
  //   jasmine.createSpyObj('FeatureService', ['getAllByApplicationId'])
  // );
  const applicationServiceSpy = jasmine.createSpyObj('ApplicationService', ['getAll']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppMapComponent],
      providers: [ConfigService, { provide: ApplicationService, useValue: applicationServiceSpy }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
