import { TestBed, inject } from '@angular/core/testing';

import { AmendmentsResolverService } from './amendments-resolver.service';

describe('AmendmentsResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AmendmentsResolverService]
    });
  });

  it('should be created', inject([AmendmentsResolverService], (service: AmendmentsResolverService) => {
    expect(service).toBeTruthy();
  }));
});
