import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTabContentComponent } from './compliance-tab-content.component';

describe('ComplianceTabContentComponent', () => {
  let component: ComplianceTabContentComponent;
  let fixture: ComponentFixture<ComplianceTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
