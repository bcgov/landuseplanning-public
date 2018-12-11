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
import { ActivatedRoute } from '@angular/router';

describe('CommentingTabComponent', () => {
  let component: CommentingTabComponent;
  let fixture: ComponentFixture<CommentingTabComponent>;

  const existingApplication = new Application();
  const activatedRouteStub = {
    parent: {
      data: Observable.of({application: existingApplication}),
      snapshot: {}
    }
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
        { provide: ActivatedRoute, useValue: activatedRouteStub }
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
});
