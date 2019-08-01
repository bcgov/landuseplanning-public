import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalDirectionComponent } from './legal-direction.component';

describe('LegalDirectionComponent', () => {
  let component: LegalDirectionComponent;
  let fixture: ComponentFixture<LegalDirectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LegalDirectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalDirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
