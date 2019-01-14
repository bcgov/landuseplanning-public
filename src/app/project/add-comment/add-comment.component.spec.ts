import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCommentComponent } from './add-comment.component';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriod } from 'app/models/commentperiod';

describe('AddCommentComponent', () => {
  let component: AddCommentComponent;
  let fixture: ComponentFixture<AddCommentComponent>;
  const commentPeriod = new CommentPeriod({});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AddCommentComponent,
        FileUploadComponent
      ],
      imports: [
        FormsModule,
        MatProgressBarModule
      ],
      providers: [
        NgbActiveModal,
        { provide: CommentService },
        { provide: DocumentService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentComponent);
    component = fixture.componentInstance;
    component.currentPeriod = commentPeriod;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
