import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ProjectActivitiesComponent } from './project-activities.component';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { Project } from 'app/models/project';

describe('ProjectActivitiesComponent', () => {
  let component: ProjectActivitiesComponent;
  let fixture: ComponentFixture<ProjectActivitiesComponent>;

  const tableParams = new TableParamsObject();
  tableParams.currentPage = 1;
  tableParams.pageSize = 10;
  tableParams.sortBy = '-dateAdded';

  const activities = [{ data: { meta: [{ searchResultsTotal: 1 }], searchResults: [{ headline: 'Activity', dateAdded: '2020-01-01' }] } }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
  declarations: [ ProjectActivitiesComponent ],
  imports: [RouterTestingModule, FormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), data: of({}), snapshot: { params: {} } } },
        { provide: TableTemplateUtils, useValue: { getParamsFromUrl: () => tableParams, updateUrl: () => {} } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectActivitiesComponent);
    component = fixture.componentInstance;
    component.project = new Project({ _id: 'proj-1' });
    component.activities = activities;
    component.tableParams = tableParams;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
