import { TestBed, inject } from '@angular/core/testing';
import { of } from 'rxjs';

import { PinsResolverService } from './pins-resolver.service';
import { ProjectService } from 'app/services/project.service';

describe('PinsResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PinsResolverService,
        { provide: ProjectService, useValue: { getPins: () => of([]) } }
      ]
    });
  });

  it('should be created', inject([PinsResolverService], (service: PinsResolverService) => {
    expect(service).toBeTruthy();
  }));
});
