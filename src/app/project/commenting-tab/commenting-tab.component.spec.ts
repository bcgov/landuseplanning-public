import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentingTabComponent } from './commenting-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CommentPeriod } from 'app/models/commentperiod';
import { ActivatedRouteStub } from 'app/spec/helpers';

describe('CommentingTabComponent', () => {
  let component: CommentingTabComponent;
  let fixture: ComponentFixture<CommentingTabComponent>;

  const existingApplication = new Application();
  const validRouteData = {application: existingApplication};

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);

  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const commentPeriodServiceStub = {
    isOpen() {
      return true;
    }
  };

  const commentServiceStub = {
    getAllByApplicationId() {
      return Observable.of([new Comment({})]);
    }
  };

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
      ]
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

  describe('when the application is retrievable from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData(validRouteData);
    });

    it('sets the component application to the one from the route', () => {
      expect(component.application).toEqual(existingApplication);
    });

    describe('daysRemaining', () => {
      const appCommentPeriod = new CommentPeriod({});

      beforeEach(() => {
        jasmine.clock().install();

        const currentTime = new Date(2018, 12, 1);
        const today = moment(currentTime).toDate();
        jasmine.clock().mockDate(today);
        existingApplication.currentPeriod = appCommentPeriod;
      });

      afterEach(() => {
        jasmine.clock().uninstall();
      });

      it('calculates the days remaining based on the current time', () => {
        appCommentPeriod.endDate = new Date(2018, 12, 25);

        component.ngOnInit();

        expect(component.daysRemaining).toEqual('25 Days Remaining');
      });

      it('uses the correct language when the end date is the current date', () => {
        appCommentPeriod.endDate = new Date(2018, 12, 1);

        component.ngOnInit();

        expect(component.daysRemaining).toEqual('1 Day Remaining');
      });


      it('uses negative values when the date is in the past', () => {
        appCommentPeriod.endDate = new Date(2018, 11, 29);

        component.ngOnInit();

        expect(component.daysRemaining).toEqual('-2 Days Remaining');
      });

      describe('when there is no comment period', () => {
        beforeEach(() => {
          existingApplication.currentPeriod = null;
        });

        it('sets daysRemaining as a "?" ', () => {
          const thisFixture = TestBed.createComponent(CommentingTabComponent);
          const thisComponent = thisFixture.componentInstance;

          expect(thisComponent.daysRemaining).toEqual('?');
        });
      });
    });

    describe('comments', () => {
      const application = new Application({_id: 'AAAA'});
      const oldComment = new Comment({dateAdded: new Date(2018, 3, 1)});
      const mediumComment = new Comment({dateAdded: new Date(2018, 6, 1)});
      const newComment = new Comment({dateAdded: new Date(2018, 11, 1)});
      let commentService: CommentService;

      beforeEach(() => {
        activatedRouteStub.setParentData({application: application});
        commentService = TestBed.get(CommentService);
      });

      it('calls commentService getAllByApplicationId with the app id from the route', () => {
        spyOn(commentService, 'getAllByApplicationId').and.callThrough();

        component.ngOnInit();

        expect(commentService.getAllByApplicationId).toHaveBeenCalledWith('AAAA');
      });

      it('attaches the resulting comments to the component and sorts by date descending', () => {
        const commentResponse = Observable.of([mediumComment, newComment, oldComment]);
        spyOn(commentService, 'getAllByApplicationId').and.returnValue(commentResponse);

        component.ngOnInit();

        expect(component.comments).toEqual([oldComment, mediumComment, newComment]);
      });

      it('sets loading to false', () => {
        component.ngOnInit();
        expect(component.loading).toEqual(false);
      });
    });
  });

  describe('when the application is not available from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setParentData({something: 'went wrong'});
    });

    it('redirects to /applications', () => {
      component.ngOnInit();
      expect(component.loading).toEqual(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/applications']);
    });
  });
});
