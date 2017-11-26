import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TailingsManagementComponent } from './tailings-management.component';

describe('TailingsManagementComponent', () => {
  let component: TailingsManagementComponent;
  let fixture: ComponentFixture<TailingsManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TailingsManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TailingsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
