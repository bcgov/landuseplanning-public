import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExternalLinkComponent } from './external-link.component';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommentService } from 'app/services/comment.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Comment } from 'app/models/comment';
import { ConfigService } from 'app/services/config.service';
import { CommonModule } from '@angular/common';

describe('ExternalLinkComponent', () => {
  let component: ExternalLinkComponent;
  let fixture: ComponentFixture<ExternalLinkComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule
      ],
      declarations: [ExternalLinkComponent],
      providers: [
        NgbActiveModal,
        { provide: CommentService, useValue: { add: () => of(new Comment({ _id: '123' })) } },
        { provide: ConfigService, useValue: { lists: [{ searchResults: [{ type: 'author', name: 'Public' }] }] } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalLinkComponent);
    component = fixture.componentInstance;
    component.externalToolPopupText = '<p>This is the text for the external link <a href="https://www.notarealwebsitedontgohere.com">Not a real website</a></p>';
    component.externalToolPopupURL = 'https://www.notarealwebsitedontgohere.com';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
