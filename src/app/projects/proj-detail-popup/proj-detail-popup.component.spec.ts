import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjDetailPopupComponent } from './proj-detail-popup.component';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';
import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { RouterTestingModule } from '@angular/router/testing';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Project } from 'app/models/project';

describe('ProjDetailPopupComponent', () => {
  let component: ProjDetailPopupComponent;
  let fixture: ComponentFixture<ProjDetailPopupComponent>;
  const project = new Project({ _id: 'BBBB', appStatus: 'Project Under Review' });
  const stubProjectService = {
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
        ProjDetailPopupComponent,
        VarDirective
      ],
      imports: [NgxTextOverflowClampModule, RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: stubProjectService },
        { provide: CommentPeriodService, useValue: stubCommentPeriodService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjDetailPopupComponent);
    component = fixture.componentInstance;
    component.proj = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
