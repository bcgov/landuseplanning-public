import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsTabContentComponent } from './comments-tab-content.component';

describe('CommentsTabContentComponent', () => {
  let component: CommentsTabContentComponent;
  let fixture: ComponentFixture<CommentsTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentsTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
