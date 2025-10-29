import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DocumentDetailResolver } from './document-detail-resolver.service';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';

describe('DocumentDetailResolver', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      DocumentDetailResolver,
      { provide: DocumentService, useValue: { getById: () => of({}) } },
      { provide: SearchService, useValue: {} }
    ]
  }));

  it('should be created', () => {
    const service: DocumentDetailResolver = TestBed.inject(DocumentDetailResolver);
    expect(service).toBeTruthy();
  });
});
