import { TestBed, inject } from '@angular/core/testing';
import { ConfigService } from './config.service';
import { ApiService } from './api';
import { of } from 'rxjs';

describe('ConfigService', () => {
  const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getLists', 'handleError', 'getFullDataSet']);
  apiServiceSpy.getFullDataSet.and.returnValue(of([]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });
  });

  it('should be created', inject([ConfigService], (service: ConfigService) => {
    expect(service).toBeTruthy();
  }));
});
