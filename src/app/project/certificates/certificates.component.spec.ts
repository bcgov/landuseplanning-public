import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { CertificatesComponent } from './certificates.component';
import { StorageService } from 'app/services/storage.service';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

describe('CertificatesComponent', () => {
  let component: CertificatesComponent;
  let fixture: ComponentFixture<CertificatesComponent>;

  const routerStub = {
    url: '/p/1/certificates',
    navigate: jasmine.createSpy('navigate')
  } as Partial<Router>;

  const storageServiceStub = {
    state: {
      currentProject: { data: { _id: '1' } }
    }
  } as Partial<StorageService>;

  const tableTemplateUtilsStub = {
    getParamsFromUrl: () => {
      const params = new TableParamsObject();
      params.sortBy = '+displayName';
      return params;
    }
  } as Partial<TableTemplateUtils>;

  const activatedRouteStub = {
    queryParams: of({}),
    data: of({ documents: [{ data: { meta: [{ searchResultsTotal: 0 }], searchResults: [] } }] })
  } as Partial<ActivatedRoute>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CertificatesComponent],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: StorageService, useValue: storageServiceStub },
        { provide: TableTemplateUtils, useValue: tableTemplateUtilsStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
