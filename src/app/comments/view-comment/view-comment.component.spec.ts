import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCommentComponent } from './view-comment.component';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { DialogService } from 'ng2-bootstrap-modal';
import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Comment } from 'app/models/comment';

describe('ViewCommentComponent', () => {
  let component: ViewCommentComponent;
  let fixture: ComponentFixture<ViewCommentComponent>;

  const commentServiceStub = {
    getById() {
      const comment = new Comment();
      return Observable.of(comment);
    }
  };

  const apiServiceStub = {
    getDocumentUrl() {
      return 'http://fake.host/document/2';
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CommentService, useValue: commentServiceStub },
        { provide: DialogService, useValue: jasmine.createSpy('DialogService') },
        { provide: ApiService, useValue: apiServiceStub },
      ],
      declarations: [ ViewCommentComponent, NewlinesPipe ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
