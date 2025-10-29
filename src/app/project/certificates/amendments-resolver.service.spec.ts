import { TestBed, inject } from '@angular/core/testing';

import { AmendmentsResolverService } from './amendments-resolver.service';
import { SearchService } from 'app/services/search.service';
import { of } from 'rxjs';

const searchServiceStub = {
  getSearchResults() {
    return of([]);
  }
};

describe('AmendmentsResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AmendmentsResolverService,
        { provide: SearchService, useValue: searchServiceStub }
      ]
    });
  });

  it('should be created', inject([AmendmentsResolverService], (service: AmendmentsResolverService) => {
    expect(service).toBeTruthy();
  }));
});
