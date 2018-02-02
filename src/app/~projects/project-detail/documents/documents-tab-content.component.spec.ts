import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsTabContentComponent } from './documents-tab-content.component';

describe('DocumentsTabContentComponent', () => {
  let component: DocumentsTabContentComponent;
  let fixture: ComponentFixture<DocumentsTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
