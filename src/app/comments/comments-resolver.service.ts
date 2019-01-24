import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentsResolver implements Resolve<CommentPeriod> {

  constructor(private commentPeriodService: CommentPeriodService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommentPeriod> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    // force-reload so we always have latest data
    return this.commentPeriodService.getByIdWithComments(commentPeriodId, true)
      .catch(() => { return Observable.of(null); });
  }
}
