import { TestBed, inject } from '@angular/core/testing';

import { CommentperiodService } from './commentperiod.service';

describe('CommentperiodService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommentperiodService]
    });
  });

  it('should be created', inject([CommentperiodService], (service: CommentperiodService) => {
    expect(service).toBeTruthy();
  }));
});
