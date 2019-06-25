import { TestBed, inject } from '@angular/core/testing';

import { CertificatesResolver } from './certificates-resolver.service';

describe('CertificatesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CertificatesResolver]
    });
  });

  it('should be created', inject([CertificatesResolver], (service: CertificatesResolver) => {
    expect(service).toBeTruthy();
  }));
});
