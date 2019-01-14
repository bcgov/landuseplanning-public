import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ProjectService } from 'app/services/project.service';
import { Project } from 'app/models/project';

@Injectable()
export class ProjectResolver implements Resolve<Project> {

  constructor(private projectService: ProjectService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project> {
    const appId = route.paramMap.get('appId');
    // force-reload so we always have latest data
    return this.projectService.getById(appId, true)
      .catch(() => { return Observable.of(null); });
  }
}
