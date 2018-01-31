import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTabContentComponent } from './application-tab-content.component';

describe('ApplicationTabContentComponent', () => {
  let component: ApplicationTabContentComponent;
  let fixture: ComponentFixture<ApplicationTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
