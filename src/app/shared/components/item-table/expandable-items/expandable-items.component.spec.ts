import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableItemsComponent } from './expandable-items.component';

describe('ExpandableItemsComponent', () => {
  let component: ExpandableItemsComponent;
  let fixture: ComponentFixture<ExpandableItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandableItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandableItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
