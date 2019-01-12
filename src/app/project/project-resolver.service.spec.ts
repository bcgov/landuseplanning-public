import { TestBed, inject } from '@angular/core/testing';
import { ProjectResolver } from './project-resolver.service';

describe('ProjectResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectResolver]
    });
  });

  xit('should be created', inject([ProjectResolver], (service: ProjectResolver) => {
    expect(service).toBeTruthy();
  }));
});
