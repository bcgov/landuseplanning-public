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

  /**
   * Retrieves documents or external links
   *
   * @param route The route to get params from.
   * @param schema The schema type to use, either 'Document' or 'ExternalLink'
   * @param projectId The project ID of the documents you wish to retrieve
   * @returns {Observable<Object>}
   */
  public getFiles = (route: ActivatedRouteSnapshot, schema: string, projectId: string): Observable<Object> => {
    const keywords = route.params?.keywords || '';
    const dataset = schema;
    const fields = [{ name: 'project', value: projectId }];
    const pageNum = route.params?.currentPage || 1;
    const pageSize = 100;
    const sortBy = route.params?.sortBy || '-dateAdded';
    const queryModifier = schema === 'Document' ? { documentSource: 'PROJECT', internalExt: 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt' } : {};
    const populate = true;
    return this.searchService.getSearchResults(keywords, dataset, fields, pageNum, pageSize, sortBy, queryModifier, populate);
  };

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');

    return zip(
      this.getFiles(route, 'Document', projectId),
      this.documentSectionService.getAll(projectId),
      this.getFiles(route, 'ExternalLink', projectId),
    );
  }
}
