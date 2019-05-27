import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceOversightComponent } from './compliance-oversight.component';

describe('ComplianceOversightComponent', () => {
  let component: ComplianceOversightComponent;
  let fixture: ComponentFixture<ComplianceOversightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceOversightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceOversightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
