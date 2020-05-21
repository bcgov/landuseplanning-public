import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSurveyResponseComponent } from './add-survey-response.component';

describe('AddSurveyResponseComponent', () => {
  let component: AddSurveyResponseComponent;
  let fixture: ComponentFixture<AddSurveyResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSurveyResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSurveyResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
