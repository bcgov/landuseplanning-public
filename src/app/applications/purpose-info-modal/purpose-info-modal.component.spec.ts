import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurposeInfoModalComponent } from './purpose-info-modal.component';

describe('PurposeInfoModalComponent', () => {
  let component: PurposeInfoModalComponent;
  let fixture: ComponentFixture<PurposeInfoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurposeInfoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurposeInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
