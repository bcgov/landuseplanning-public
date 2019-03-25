import { TestBed, inject } from '@angular/core/testing';

import { FeatureService } from './feature.service';
import { ApiService } from './api';

describe('FeatureService', () => {
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getFeaturesByTantalisId', 'getFeaturesByApplicationId']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeatureService, { provide: ApiService, useValue: apiServiceSpy }]
    });
  });

  it('should be created', inject([FeatureService], (service: FeatureService) => {
    expect(service).toBeTruthy();
  }));
});
