import { TestBed } from '@angular/core/testing';

import { InfoBannerService } from './infoBanner.service';
import { ApiService } from './api';

describe('InfoBannerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      InfoBannerService,
      { provide: ApiService, useValue: jasmine.createSpyObj('ApiService', ['getOrgsByCompanyType', 'handleError']) }
    ]
  }));

  it('should be created', () => {
    const service: InfoBannerService = TestBed.inject(InfoBannerService);
    expect(service).toBeTruthy();
  });
});
