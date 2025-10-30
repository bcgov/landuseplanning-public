import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCommentComponent } from './add-comment.component';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';
import { ConfigService } from 'app/services/config.service';
import { Project } from 'app/models/project';

describe('AddCommentComponent', () => {
  let component: AddCommentComponent;
  let fixture: ComponentFixture<AddCommentComponent>;
  const commentPeriod = new CommentPeriod({
    _id: 'cp-1',
    collectionNotice: 'Collection Notice',
    commentingMethod: 'publicComment'
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddCommentComponent
      ],
      imports: [
        FormsModule,
        MatProgressBarModule
      ],
      providers: [
        NgbActiveModal,
        { provide: CommentService, useValue: { add: () => of(new Comment({ _id: '123' })) } },
        { provide: DocumentService, useValue: { add: () => of(new Document({})) } },
        { provide: ConfigService, useValue: { lists: [{ searchResults: [{ type: 'author', name: 'Public' }] }] } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentComponent);
    component = fixture.componentInstance;
    component.currentPeriod = commentPeriod;
    component.project = new Project({ _id: 'proj-1' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
