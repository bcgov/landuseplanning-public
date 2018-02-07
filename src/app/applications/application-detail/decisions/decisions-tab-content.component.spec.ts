import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionsTabContentComponent } from './decisions-tab-content.component';

describe('DecisionsTabContentComponent', () => {
  let component: DecisionsTabContentComponent;
  let fixture: ComponentFixture<DecisionsTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionsTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionsTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
