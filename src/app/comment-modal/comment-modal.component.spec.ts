import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentModalComponent } from './comment-modal.component';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriod } from 'app/models/commentperiod';

describe('CommentModalComponent', () => {
  let component: CommentModalComponent;
  let fixture: ComponentFixture<CommentModalComponent>;
  const commentPeriod = new CommentPeriod({});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentModalComponent, FileUploadComponent],
      imports: [FormsModule, MatProgressBarModule],
      providers: [NgbActiveModal, { provide: CommentService }, { provide: DocumentService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentModalComponent);
    component = fixture.componentInstance;
    component.currentPeriod = commentPeriod;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
