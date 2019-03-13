import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { MarkerPopupComponent } from './marker-popup.component';
import { VarDirective } from 'app/utils/ng-var.directive';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Application } from 'app/models/application';

describe('MarkerPopupComponent', () => {
  let component: MarkerPopupComponent;
  let fixture: ComponentFixture<MarkerPopupComponent>;
  const application = new Application({ _id: 'BBBB', appStatus: 'Application Under Review' });
  const stubApplicationService = {
    getStatusCode() {
      return 'AC';
    },
    isAccepted() {
      return true;
    },
    isDispGoodStanding() {
      return false;
    },
    isOffered() {
      return true;
    },
    isOfferAccepted() {
      return true;
    },
    isOfferNotAccepted() {
      return false;
    },
    isAbandoned() {
      return false;
    },
    isAllowed() {
      return false;
    },
    isDisallowed() {
      return false;
    },
    isSuspended() {
      return false;
    },
    isUnknown() {
      return false;
    },
    isCancelled() {
      return false;
    }
  };

  const stubCommentPeriodService = {
    isOpen() {
      return true;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarkerPopupComponent, VarDirective],
      imports: [NgxTextOverflowClampModule, RouterTestingModule],
      providers: [
        { provide: ApplicationService, useValue: stubApplicationService },
        { provide: CommentPeriodService, useValue: stubCommentPeriodService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkerPopupComponent);
    component = fixture.componentInstance;
    component.app = application;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
