import { TestBed, inject } from '@angular/core/testing';
import { SearchService } from './search.service';
import { ApiService } from './api';
import { of } from 'rxjs';

describe('SearchService', () => {
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getItem', 'getFullDataSet', 'searchKeywords', 'getTopNewsItems']);
  apiServiceSpy.getItem.and.returnValue(of([]));
  apiServiceSpy.getFullDataSet.and.returnValue(of([]));
  apiServiceSpy.searchKeywords.and.returnValue(of([]));
  apiServiceSpy.getTopNewsItems.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });
  });

  it('should be created', inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});
