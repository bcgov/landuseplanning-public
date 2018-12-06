import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppExploreComponent } from './app-explore.component';

describe('AppExploreComponent', () => {
  let component: AppExploreComponent;
  let fixture: ComponentFixture<AppExploreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppExploreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
