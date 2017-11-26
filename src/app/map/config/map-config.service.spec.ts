import { TestBed, inject } from '@angular/core/testing';

import { MapConfigService } from './map-config.service';

describe('MapConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapConfigService]
    });
  });

  it('should be created', inject([MapConfigService], (service: MapConfigService) => {
    expect(service).toBeTruthy();
  }));
});
