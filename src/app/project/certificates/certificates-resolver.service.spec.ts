import { TestBed, inject } from '@angular/core/testing';

import { CertificatesResolver } from './certificates-resolver.service';
import { SearchService } from 'app/services/search.service';
import { of } from 'rxjs';

const searchServiceStub = {
  getSearchResults() {
    return of([]);
  }
};

describe('CertificatesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CertificatesResolver,
        { provide: SearchService, useValue: searchServiceStub }
      ]
    });
  });

  it('should be created', inject([CertificatesResolver], (service: CertificatesResolver) => {
    expect(service).toBeTruthy();
  }));
});
