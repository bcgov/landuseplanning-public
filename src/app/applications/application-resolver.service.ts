import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ApplicationService } from 'app/services/application.service';
import { Application } from 'app/models/application';

@Injectable()
export class ApplicationListResolver implements Resolve<Application[]> {
  constructor(
    private applicationService: ApplicationService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Application[] | Observable<Application[]> | Promise<Application[]> {
    return this.applicationService.getAll()
      .catch(err => {
        return Observable.throw(err);
      });
  }
}

@Injectable()
export class ApplicationDetailResolver implements Resolve<Application> {
  constructor(
    private applicationService: ApplicationService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Application | Observable<Application> | Promise<Application> {
    const appId = route.paramMap.get('appId');
    return this.applicationService.getById(appId)
      .catch(err => {
        return Observable.throw(err);
      });
  }
}
