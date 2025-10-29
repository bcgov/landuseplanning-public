import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DocumentsTabComponent } from './documents-tab.component';
import { ApiService } from 'app/services/api';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { Utils } from 'app/shared/utils/utils';
import { DocumentSectionService } from 'app/services/documentSection.service';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { Document } from 'app/models/document';
import { Project } from 'app/models/project';
import { DocumentSection } from 'app/models/documentSection';

describe('DocumentsTabComponent', () => {
  let component: DocumentsTabComponent;
  let fixture: ComponentFixture<DocumentsTabComponent>;

  const tableParams = new TableParamsObject();
  tableParams.currentPage = 1;
  tableParams.pageSize = 10;
  tableParams.sortBy = '-dateAdded';

  const documentRecords = [{
    data: {
      searchResults: [new Document({ _id: 'doc-1', displayName: 'Doc 1', internalExt: 'pdf', dateAdded: '2020-01-01', internalSize: 1024 })],
      meta: [{ searchResultsTotal: 1 }]
    }
  }];

  const routeData = {
    documents: [
      documentRecords,
      [new DocumentSection({ _id: 'section-1', name: 'Section 1', order: 1 })],
      [{ data: { searchResults: [], meta: [] } }]
    ]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsTabComponent ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of(routeData), params: of({ currentPage: 1, pageSize: 10, sortBy: '-dateAdded' }) } },
        { provide: ApiService, useValue: { openDocument: jasmine.createSpy('openDocument'), downloadDocument: jasmine.createSpy('downloadDocument') } },
        { provide: SearchService, useValue: {} },
        { provide: StorageService, useValue: { state: { currentProject: { data: new Project({ _id: 'proj-1', name: 'Project 1' }) } } } },
        { provide: TableTemplateUtils, useValue: { getParamsFromUrl: () => tableParams, updateTableParams: () => tableParams, updateUrl: () => {} } },
        { provide: Utils, useValue: { formatBytes: () => '1 KB' } },
        { provide: DocumentSectionService, useValue: {} },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsTabComponent);
    component = fixture.componentInstance;
    component.tableParams = tableParams;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
