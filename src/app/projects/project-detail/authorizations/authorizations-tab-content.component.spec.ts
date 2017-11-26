import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizationsTabContentComponent } from './authorizations-tab-content.component';

describe('AuthorizationsTabContentComponent', () => {
  let component: AuthorizationsTabContentComponent;
  let fixture: ComponentFixture<AuthorizationsTabContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorizationsTabContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorizationsTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
