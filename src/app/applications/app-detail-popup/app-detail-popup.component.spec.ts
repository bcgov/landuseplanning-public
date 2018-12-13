import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailPopupComponent } from './app-detail-popup.component';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';
import { VarDirective } from 'app/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Application } from 'app/models/application';

describe('AppDetailPopupComponent', () => {
  let component: AppDetailPopupComponent;
  let fixture: ComponentFixture<AppDetailPopupComponent>;
  const application = new Application({_id: 'BBBB', appStatus: 'Application Under Review'});
  const stubApplicationService = {
    getStatusCode() { return 'AC'; },
    isAccepted() { return true; },
    isDispGoodStanding() { return false; },
    isOffered() { return true; },
    isOfferAccepted() { return true; },
    isOfferNotAccepted() { return false; },
    isAbandoned() { return false; },
    isAllowed() { return false; },
    isDisallowed() { return false; },
    isSuspended() { return false; },
    isUnknown() { return false; },
    isCancelled() { return false; }
  };

  const stubCommentPeriodService = {
    isOpen() {
      return true;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppDetailPopupComponent,
        VarDirective
      ],
      imports: [ NgxTextOverflowClampModule, RouterTestingModule ],
      providers: [
        { provide: ApplicationService, useValue: stubApplicationService },
        { provide: CommentPeriodService, useValue: stubCommentPeriodService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppDetailPopupComponent);
    component = fixture.componentInstance;
    component.app = application;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
