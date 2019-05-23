import { TestBed, inject } from '@angular/core/testing';
import { SearchService } from './search.service';
import { ApiService } from './api';

describe('SearchService', () => {
  const apiServiceSpy = jasmine.createSpyObj('ApiService', []);

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
