import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs';


import { CommentPeriodService } from 'app/services/commentperiod.service';
import { SurveyService } from 'app/services/survey.service';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentsResolver implements Resolve<CommentPeriod> {

  constructor(private commentPeriodService: CommentPeriodService,
              private surveyService: SurveyService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<CommentPeriod> {
    const commentPeriodId = route.paramMap.get('commentPeriodId');
    // force-reload so we always have latest data
    return forkJoin(
      this.commentPeriodService.getById(commentPeriodId),
      this.surveyService.getSelectedSurveyByCPId(commentPeriodId)
    ).map(([commentPeriod, surveySelected]) => {
      commentPeriod = commentPeriod;
      commentPeriod.surveySelected = surveySelected;
      return new CommentPeriod(commentPeriod);
    })
    .catch(() => { return Observable.of(null); });
  }
}
