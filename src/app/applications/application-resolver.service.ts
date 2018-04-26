import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from 'app/services/application.service';
import { Application } from 'app/models/application';

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {

  constructor(private applicationService: ApplicationService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Application> {
    const appId = route.paramMap.get('appId');
    return this.applicationService.getById(appId)
      .catch(err => { return Observable.of(null as Application); });
  }
}
