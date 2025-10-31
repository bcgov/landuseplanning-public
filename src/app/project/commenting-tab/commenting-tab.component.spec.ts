import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentingTabComponent } from './commenting-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { of } from 'rxjs';
import { Project } from 'app/models/project';
import { Comment } from 'app/models/comment';
import { ActivatedRoute, Router } from '@angular/router';
import * as dayjs from 'dayjs';
import { CommentPeriod } from 'app/models/commentperiod';
import { ActivatedRouteStub } from 'app/spec/helpers';
import { SurveyService } from 'app/services/survey.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CommentingTabComponent', () => {
  let component: CommentingTabComponent;
  let fixture: ComponentFixture<CommentingTabComponent>;

  const existingProject = new Project({ _id: 'AAAA' });
  const validRouteData = { projectAndBanner: [existingProject, [{ data: { searchResults: [] } }]] };

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);

  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const commentPeriodServiceStub = {
    isOpen() {
      return true;
    },
    getAllByProjectId() {
      return of({ data: [] });
    }
  };

  const commentServiceStub = {
    getAllByProjectId() {
      return of([new Comment({})]);
    }
  };

  const surveyServiceStub = {
    getSelectedSurveyByCPId() {
      return of(null);
    }
  } as Partial<SurveyService>;

  const ngbModalStub = {
    open: jasmine.createSpy('open').and.returnValue({
      componentInstance: {}
    })
  } as Partial<NgbModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentingTabComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: CommentService, useValue: commentServiceStub },
        { provide: CommentPeriodService, useValue: commentPeriodServiceStub },
        { provide: DialogService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
        { provide: SurveyService, useValue: surveyServiceStub },
        { provide: NgbModal, useValue: ngbModalStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when the project is retrievable from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData(validRouteData);
    });

    it('sets the component project to the one from the route', () => {
      // expect(component.project).toEqual(existingProject);
    });

    describe('daysRemaining', () => {
      const appCommentPeriod = new CommentPeriod({});

      beforeEach(() => {
        jasmine.clock().install();

        const currentTime = new Date(2018, 12, 1);
        const today = dayjs(currentTime).toDate();
        jasmine.clock().mockDate(today);
        // existingProject.currentPeriod = appCommentPeriod;
      });

      afterEach(() => {
        jasmine.clock().uninstall();
      });

      // it('calculates the days remaining based on the current time', () => {
      //   appCommentPeriod.dateCompleted = new Date(2018, 12, 25);

      //   component.ngOnInit();

      //   expect(component.daysRemaining).toEqual('25 Days Remaining');
      // });

      // it('uses the correct language when the end date is the current date', () => {
      //   appCommentPeriod.dateCompleted = new Date(2018, 12, 1);

      //   component.ngOnInit();

      //   expect(component.daysRemaining).toEqual('1 Day Remaining');
      // });


      // it('uses negative values when the date is in the past', () => {
      //   appCommentPeriod.dateCompleted = new Date(2018, 11, 29);

      //   component.ngOnInit();

      //   expect(component.daysRemaining).toEqual('-2 Days Remaining');
      // });

      // describe('when there is no comment period', () => {
      //   beforeEach(() => {
      //     // existingProject.currentPeriod = null;
      //   });

      //   it('sets daysRemaining as a "?" ', () => {
      //     const thisFixture = TestBed.createComponent(CommentingTabComponent);
      //     const thisComponent = thisFixture.componentInstance;

      //     expect(thisComponent.daysRemaining).toEqual('?');
      //   });
      // });
    });

    describe('comments', () => {
  const project = new Project({ _id: 'AAAA' });
      const oldComment = new Comment({ dateAdded: new Date(2018, 3, 1) });
      const mediumComment = new Comment({ dateAdded: new Date(2018, 6, 1) });
      const newComment = new Comment({ dateAdded: new Date(2018, 11, 1) });
      let commentService: CommentService;

      beforeEach(() => {
  activatedRouteStub.setParentData({ projectAndBanner: [project, [{ data: { searchResults: [] } }]] });
        commentService = TestBed.inject(CommentService);
      });

      // it('calls commentService getAllByProjectId with the app id from the route', () => {
      //   spyOn(commentService, 'getAllByProjectId').and.callThrough();

      //   component.ngOnInit();

      //   expect(commentService.getAllByProjectId).toHaveBeenCalledWith('AAAA');
      // });

      // it('attaches the resulting comments to the component and sorts by date descending', () => {
      //   const commentResponse = Observable.of([mediumComment, newComment, oldComment]);
      //   spyOn(commentService, 'getAllByProjectId').and.returnValue(commentResponse);

      //   component.ngOnInit();

      //   expect(component.comments).toEqual([oldComment, mediumComment, newComment]);
      // });

      it('sets loading to false', () => {
        component.ngOnInit();
        expect(component.loading).toEqual(false);
      });
    });
  });

  describe('when the project is not available from the route', () => {
    beforeEach(() => {
      // activatedRouteStub.setParentData({something: 'went wrong'});
    });

    it('redirects to /projects', () => {
      // component.ngOnInit();
      // expect(component.loading).toEqual(false);
      // expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
    });
  });
});
