import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplistMapComponent } from './applist-map.component';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';

describe('ApplistMapComponent', () => {
  let component: ApplistMapComponent;
  let fixture: ComponentFixture<ApplistMapComponent>;

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
      declarations: [ApplistMapComponent],
      providers: [
        ConfigService,
        { provide: ApplicationService, useValue: applicationServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplistMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
