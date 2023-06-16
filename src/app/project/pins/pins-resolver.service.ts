import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { ProjectService } from 'app/services/project.service';

@Injectable()
export class PinsResolverService implements Resolve<Observable<object>> {
  constructor(
    private projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const pageNum = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy ? route.params.sortBy : '+name';

    // force-reload so we always have latest data
    return this.projectService.getPins(projectId, pageNum, pageSize, sortBy);
  }
}
