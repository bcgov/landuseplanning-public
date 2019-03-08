import { TestBed, inject } from '@angular/core/testing';
import { CommentsResolver } from './comments-resolver.service';

describe('CommentsResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentsResolver]
    });
  });

  xit('should be created', inject([CommentsResolver], (service: CommentsResolver) => {
    expect(service).toBeTruthy();
  }));
});
