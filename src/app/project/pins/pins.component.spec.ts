import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PinsComponent } from './pins.component';
import { ApiService } from 'app/services/api';
import { SearchService } from 'app/services/search.service';
import { StorageService } from 'app/services/storage.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { Project } from 'app/models/project';
import { PlatformLocation } from '@angular/common';

describe('PinsComponent', () => {
  let component: PinsComponent;
  let fixture: ComponentFixture<PinsComponent>;

  const tableParams = new TableParamsObject();
  tableParams.currentPage = 1;
  tableParams.pageSize = 10;
  tableParams.sortBy = '+name';

  const pins = [{ _id: 'pin-1', name: 'Nation', province: 'BC' }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinsComponent ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), data: of({ pins }) } },
        { provide: ApiService, useValue: {} },
        { provide: SearchService, useValue: {} },
        { provide: StorageService, useValue: { state: { currentProject: { data: new Project({ _id: 'proj-1' }) } } } },
        { provide: TableTemplateUtils, useValue: { getParamsFromUrl: () => tableParams } },
        { provide: PlatformLocation, useValue: { } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate'), url: '/test' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinsComponent);
    component = fixture.componentInstance;
    component.tableParams = tableParams;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
