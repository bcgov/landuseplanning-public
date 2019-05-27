import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegislationComponent } from './legislation.component';

describe('LegislationComponent', () => {
  let component: LegislationComponent;
  let fixture: ComponentFixture<LegislationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegislationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegislationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
