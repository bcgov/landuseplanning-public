import { TestBed } from '@angular/core/testing';

import { OrgService } from './org.service';
import { ApiService } from './api';

describe('OrgService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      OrgService,
      { provide: ApiService, useValue: jasmine.createSpyObj('ApiService', ['getOrgsByCompanyType', 'handleError']) }
    ]
  }));

  it('should be created', () => {
    const service: OrgService = TestBed.inject(OrgService);
    expect(service).toBeTruthy();
  });
});
