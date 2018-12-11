import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef } from '@angular/core';
import { VarDirective } from './ng-var.directive';

@Component({
  template: `<div id="tableTop"></div><button ngVar>`
})

class TestVarComponent {}

xdescribe('VarDirective', () => {
  let component: TestVarComponent;
  // let directive: VarDirective;
  let fixture: ComponentFixture<TestVarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VarDirective, TestVarComponent],
      providers: [TemplateRef]
    });

    fixture = TestBed.createComponent(TestVarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    // expect(directive).toBeTruthy();
  });
});
