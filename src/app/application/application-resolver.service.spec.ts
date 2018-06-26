import { TestBed, inject } from '@angular/core/testing';
import { ApplicationResolver } from './application-resolver.service';

describe('ApplicationResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationResolver]
    });
  });

  it('should be created', inject([ApplicationResolver], (service: ApplicationResolver) => {
    expect(service).toBeTruthy();
  }));
});
