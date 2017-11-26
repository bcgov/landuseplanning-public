import { TestBed, inject } from '@angular/core/testing';

import { ProjectDetailResolver } from './project-detail-resolver.service';

describe('ProjectDetailResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectDetailResolver]
    });
  });

  it('should be created', inject([ProjectDetailResolver], (service: ProjectDetailResolver) => {
    expect(service).toBeTruthy();
  }));
});
