import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationsComponent } from './applications.component';
import { ApplistFiltersComponent } from 'app/applications/applist-filters/applist-filters.component';
import { ApplistListComponent } from 'app/applications/applist-list/applist-list.component';
import { ApplistMapComponent } from './applist-map/applist-map.component';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VarDirective } from 'app/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Application } from 'app/models/application';

describe('ApplicationsComponent', () => {
  let component: ApplicationsComponent;
  let fixture: ComponentFixture<ApplicationsComponent>;
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);
  const commentPeriodService = new CommentPeriodService(
    apiServiceSpy
  );

  const applicationServiceStub = {
    getCount() {
      return Observable.of(2);
    },

    getAllFull() {
      const applicationOne = new Application();
      const applicationTwo = new Application();
      return Observable.of([applicationOne, applicationTwo]);
    }
  };



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationsComponent,
        ApplistFiltersComponent,
        ApplistListComponent,
        ApplistMapComponent,
        VarDirective
      ],
      imports: [
        NgbModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: [
        NgbTypeaheadConfig,
        { provide: ApplicationService, useValue: applicationServiceStub},
        { provide: MatSnackBar },
        { provide: ConfigService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
