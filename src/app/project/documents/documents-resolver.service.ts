import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, zip } from 'rxjs';

import { SearchService } from 'app/services/search.service';
import { DocumentSectionService } from 'app/services/documentSection.service';

@Injectable()
export class DocumentsResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
    private documentSectionService: DocumentSectionService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const currentPage = route.params.currentPage ? route.params.currentPage : 1;
    const sortBy = route.params.sortBy && route.params.sortBy !== 'null' ? route.params.sortBy : '-datePosted';
    const keywords = route.params.keywords;

    return zip(
      this.searchService.getSearchResults(
        keywords,
        'Document',
        [{ 'name': 'project', 'value': projectId }],
        currentPage,
        null,
        sortBy,
        { documentSource: 'PROJECT', internalExt: 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt' },
        true),
      this.documentSectionService.getAll(projectId)
    )
  }
}
