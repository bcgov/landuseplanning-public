import { TestBed, inject } from '@angular/core/testing';

import { MapLoaderService } from './map-loader.service';

describe('MapLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapLoaderService]
    });
  });

  it('should be created', inject([MapLoaderService], (service: MapLoaderService) => {
    expect(service).toBeTruthy();
  }));

  it('should throw if no map properties are provided', inject([MapLoaderService], (service: MapLoaderService) => {
    expect(() => service.load({})).toThrowError(/map properties were not provided/);
  }));
});
