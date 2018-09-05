import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailPopupComponent } from './app-detail-popup.component';

describe('AppDetailPopupComponent', () => {
  let component: AppDetailPopupComponent;
  let fixture: ComponentFixture<AppDetailPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppDetailPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
