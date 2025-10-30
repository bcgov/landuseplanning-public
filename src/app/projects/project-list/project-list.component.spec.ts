import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ProjectListComponent } from './project-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OrderByPipe } from 'app/shared/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Project } from 'app/models/project';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchService } from 'app/services/search.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;

  const projectServiceStub = {
    getAll() {
      return of([]);
    }
  };

  const searchServiceStub = {
    getSearchResults: jasmine.createSpy('getSearchResults').and.returnValue(of([{ data: { searchResults: [], meta: [{ searchResultsTotal: 0 }] } }]))
  };

  const snackBarStub = {
    open: jasmine.createSpy('open').and.returnValue({
      _dismissAfter: () => {},
      dismiss: () => {}
    })
  };

  @Component({ selector: 'app-project-list-filters', template: '' })
  class ProjectListFiltersStubComponent {
    @Input() projects: any;
    @Input() tableParams: any;
    @Output() updateMatching = new EventEmitter<any>();
  }

  @Component({ selector: 'app-table-template', template: '' })
  class TableTemplateStubComponent {
    @Input() columns: any;
    @Input() data: any;
    @Output() onColumnSort = new EventEmitter<string>();
    @Output() onPageNumUpdate = new EventEmitter<number>();
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
  declarations: [ProjectListComponent, OrderByPipe, NewlinesPipe, ProjectListFiltersStubComponent, TableTemplateStubComponent],
  imports: [RouterTestingModule, FormsModule, MatSlideToggleModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: CommentPeriodService, useValue: {} },
        { provide: MatSnackBar, useValue: snackBarStub },
        { provide: SearchService, useValue: searchServiceStub },
  { provide: TableTemplateUtils, useValue: { updateUrl: () => {}, getParamsFromUrl: () => ({}) } }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
    searchServiceStub.getSearchResults.calls.reset();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when projects are returned from the service', () => {
    const existingProjects = [
      new Project(),
      new Project()
    ];

    beforeEach(() => {
      searchServiceStub.getSearchResults.and.returnValue(of([{ data: { searchResults: existingProjects, meta: [{ searchResultsTotal: existingProjects.length }] } }])) ;
    });

    it('sets the component project to the one from the route', () => {
      component.ngOnInit();
      expect(component.projects).toEqual(existingProjects);
    });
  });

  describe('when the search service returns missing data', () => {
    beforeEach(() => {
      searchServiceStub.getSearchResults.and.returnValue(of([{}]));
    });

    it('redirects to root', () => {
      let navigateSpy = spyOn((<any>component).router, 'navigate');

      navigateSpy.calls.reset();
      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
