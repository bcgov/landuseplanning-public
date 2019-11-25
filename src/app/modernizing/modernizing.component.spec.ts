import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModernizingComponent } from './modernizing.component';

describe('EngagementComponent', () => {
  let component: ModernizingComponent;
  let fixture: ComponentFixture<ModernizingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModernizingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModernizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
