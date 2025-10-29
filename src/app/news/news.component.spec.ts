import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { NewsListComponent } from './news.component';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { SearchService } from 'app/services/search.service';
import { ActivatedRoute } from '@angular/router';

describe('NewsListComponent', () => {
  let component: NewsListComponent;
  let fixture: ComponentFixture<NewsListComponent>;

  const tableTemplateUtilsStub = {
    getParamsFromUrl: () => ({ currentPage: 1, pageSize: 10, sortBy: '-dateAdded', keywords: '', totalListItems: 0 }),
    updateUrl: () => { },
    updateTableParams: (tableParams) => tableParams
  };

  const searchServiceStub = {
    getSearchResults() {
      return {
        takeUntil() {
          return {
            subscribe(callback: (value: any) => void) {
              callback([{ data: { meta: [{ searchResultsTotal: 0 }], searchResults: [] } }]);
            }
          };
        }
      };
    }
  };

  const activatedRouteStub = {
    params: of({}),
    data: of({ activities: [{ data: { meta: [{ searchResultsTotal: 0 }], searchResults: [] } }] })
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewsListComponent],
      imports: [RouterTestingModule, FormsModule],
      providers: [
        { provide: TableTemplateUtils, useValue: tableTemplateUtilsStub },
        { provide: SearchService, useValue: searchServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
