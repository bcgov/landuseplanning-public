import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { isNullOrUndefined } from 'util';

@Injectable()
export class CommentsResolver implements Resolve<CommentPeriod> {

  constructor(private commentPeriodService: CommentPeriodService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommentPeriod> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    // force-reload so we always have latest data
    return this.commentPeriodService.getById(commentPeriodId, true).map(
      data => {
        // If nothing is passed via URL, we default currentPage to 1 and pageSize to 10
        data.currentPage = Number(route.queryParams['currentPage'] ? route.queryParams['currentPage'] : 1);
        data.pageSize = Number(route.queryParams['pageSize'] ? route.queryParams['pageSize'] : 10);
        return data;
      }
    ).catch(() => { return Observable.of(null); });
  }
}
