import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { VarDirective } from 'app/utils/ng-var.directive';
import { ApplicationsComponent } from './applications.component';
import { FindPanelComponent } from './find-panel/find-panel.component';
import { AppListComponent } from './app-list/app-list.component';
import { AppMapComponent } from './app-map/app-map.component';

describe('ApplicationsComponent', () => {
  let component: ApplicationsComponent;
  let fixture: ComponentFixture<ApplicationsComponent>;
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getApplications']);
  const commentPeriodService = new CommentPeriodService(apiServiceSpy);

  const applicationServiceStub = {
    getCount() {
      return of(2);
    },

    getAllFull() {
      const applicationOne = new Application();
      const applicationTwo = new Application();
      return of([applicationOne, applicationTwo]);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationsComponent, FindPanelComponent, AppListComponent, AppMapComponent, VarDirective],
      imports: [NgbModule, FormsModule, RouterTestingModule],
      providers: [
        NgbTypeaheadConfig,
        { provide: ApplicationService, useValue: applicationServiceStub },
        { provide: MatSnackBar },
        { provide: CommentPeriodService, useValue: commentPeriodService }
      ]
    }).compileComponents();
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
