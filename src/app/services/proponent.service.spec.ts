import { TestBed, inject } from '@angular/core/testing';
import { ProponentService } from './proponent.service';

describe('ProponentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProponentService]
    });
  });

  it('should be created', inject([ProponentService], (service: ProponentService) => {
    expect(service).toBeTruthy();
  }));
});
