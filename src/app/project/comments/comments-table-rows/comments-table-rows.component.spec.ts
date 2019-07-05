import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsTableRowsComponent } from './comments-table-rows.component';

describe('ExpandableItemsComponent', () => {
  let component: CommentsTableRowsComponent;
  let fixture: ComponentFixture<CommentsTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentsTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
