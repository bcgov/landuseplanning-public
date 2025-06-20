import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ShapeFileResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const currentPage = 1;
    const pageSize = 100;
    const sortBy = '-datePosted';
    const keywords = '';
    return this.searchService.getSearchResults(
      keywords,
      'Document',
      [{ 'name': 'project', 'value': projectId }],
      currentPage,
      pageSize,
      sortBy,
      { documentSource: 'SHAPEFILE' }, // Only look for shapefiles so we are not needlessly parsing through images or other documents.
      true);
  }
}
