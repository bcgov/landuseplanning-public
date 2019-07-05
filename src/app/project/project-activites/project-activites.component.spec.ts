import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectActivitesComponent } from './project-activites.component';

describe('ProjectActivitesComponent', () => {
  let component: ProjectActivitesComponent;
  let fixture: ComponentFixture<ProjectActivitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectActivitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectActivitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
