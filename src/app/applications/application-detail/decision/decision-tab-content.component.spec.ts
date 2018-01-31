import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionTabContentComponent } from './decision-tab-content.component';

describe('DecisionTabContentComponent', () => {
  let component: DecisionTabContentComponent;
  let fixture: ComponentFixture<DecisionTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
