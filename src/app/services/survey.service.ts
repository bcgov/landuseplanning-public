import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import { ApiService } from './api';
import { Survey } from 'app/models/survey';
// import { CommentService } from './comment.service';

@Injectable()
export class SurveyService {

  private commentPeriodStatuses: Array<string> = []; // use helper to get these
  private survey: Survey = null; // for caching

  constructor(
    private api: ApiService,
    // private commentService: CommentService,
  ) {}

  // get all comment periods for the specified application id
  // getAllByProjectId(projId: string): Observable<Object> {
  //   return this.api.getPeriodsByProjId(projId)
  //     .map((res: any) => {
  //       if (res) {
  //         const periods: Array<CommentPeriod> = [];
  //         if (!res || res.length === 0) {
  //           return periods;
  //         }
  //         res.forEach(cp => {
  //           periods.push(new CommentPeriod(cp));
  //         });
  //         return { totalCount: res.length, data: periods };
  //       }
  //       return {};
  //     })
  //     .catch(error => this.api.handleError(error));
  // }

  // get a specific comment period by its id
  getById(surveyId: string): Observable<Survey> {
    return this.api.getSurvey(surveyId)
      .map((res: any) => {
        if (res) {
          const surveys = res;
          // return the first (only) comment period
          console.log('from the service', res)
          return surveys.length > 0 ? new Survey(surveys[0]) : null;
        }
      })
      .map((survey: Survey) => {
        if (!survey) { return null as Survey; }

        this.survey = survey;
        return this.survey;
      })
      .catch(this.api.handleError);
  }

  // get a survey selected on a comment period by comment period id
  getSelectedSurveyByCPId(periodId: string): Observable<Survey> {
    return this.api.getPeriodSelectedSurvey(periodId)
      .map((res: any) => {
        if (res) {
          const surveys = res;
          // return the first (only) comment period
          return surveys.length > 0 ? new Survey(surveys[0]) : null;
        }
      })
      .map((survey: Survey) => {
        if (!survey) { return null as Survey; }

        this.survey = survey;
        return this.survey;
      })
      .catch(this.api.handleError);
  }

    // get a survey selected by comment period associated with a given project
    getSelectedSurveyByProjId(projId: string): Observable<Survey> {
      return this.api.getProjectSelectedSurvey(projId)
        .map((res: any) => {
          if (res) {
            const surveys = res;
            // return the first (only) comment period
            return surveys.length > 0 ? new Survey(surveys[0]) : null;
          }
        })
        .map((survey: Survey) => {
          if (!survey) { return null as Survey; }

          this.survey = survey;
          return this.survey;
        })
        .catch(this.api.handleError);
    }

  // get a specific comment period by its id
  // getByIdWithComments(periodId: string, forceReload: boolean = false): Observable<CommentPeriod> {
  //   if (this.commentPeriod && this.commentPeriod._id === periodId && !forceReload) {
  //     return Observable.of(this.commentPeriod);
  //   }
  //   return this.api.getPeriod(periodId)
  //     .map(res: any) => {
  //       const periods = res.text() ? res.json() : [];
  //       // return the first (only) comment period
  //       return periods.length > 0 ? new CommentPeriod(periods[0]) : null;
  //     })
  //     .mergeMap(commentPeriod => {
  //       if (!commentPeriod) { return Observable.of(null as CommentPeriod); }

  //       const promises: Array<Promise<any>> = [];

  //       // get the current comment period
  //       promises.push(this.commentService.getAllByPeriodId(commentPeriod._id)
  //         .toPromise()
  //         .then(comments => {
  //           commentPeriod.comments = comments;
  //         })
  //       );
  //       return Promise.all(promises).then(() => {
  //         this.commentPeriod = commentPeriod;
  //         return this.commentPeriod;
  //       });
  //     })
  //     .catch(this.api.handleError);
  // }

  // returns first period - multiple comment periods are currently not supported
  // getCurrent(periods: CommentPeriod[]): CommentPeriod {
  //   return (periods.length > 0) ? periods[0] : null;
  // }

  /**
   * Given a comment period, returns status abbreviation.
   */
  // getStatusCode(commentPeriod: CommentPeriod): string {
  //   if (!commentPeriod || !commentPeriod.dateStarted || !commentPeriod.dateCompleted) {
  //     return this.NOT_OPEN;
  //   }

  //   const now = new Date();
  //   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  //   if (commentPeriod.dateCompleted < today) {
  //     return this.CLOSED;
  //   } else if (commentPeriod.dateStarted > today) {
  //     return this.NOT_STARTED;
  //   } else {
  //     return this.OPEN;
  //   }
  // }

  /**
     * Given a status code, returns user-friendly status string.
     */
  // getStatusString(statusCode: string): string {
  //   switch (statusCode) {
  //     case this.NOT_STARTED: return this.commentPeriodStatuses[this.NOT_STARTED];
  //     case this.NOT_OPEN: return this.commentPeriodStatuses[this.NOT_OPEN];
  //     case this.CLOSED: return this.commentPeriodStatuses[this.CLOSED];
  //     case this.OPEN: return this.commentPeriodStatuses[this.OPEN];
  //   }
  //   return null;
  // }

  // isNotOpen(commentPeriod: CommentPeriod): boolean {
  //   return (this.getStatusCode(commentPeriod) === this.NOT_OPEN);
  // }

  // isClosed(commentPeriod: CommentPeriod): boolean {
  //   return (this.getStatusCode(commentPeriod) === this.CLOSED);
  // }

  // isNotStarted(commentPeriod: CommentPeriod): boolean {
  //   return (this.getStatusCode(commentPeriod) === this.NOT_STARTED);
  // }

  // isOpen(commentPeriod: CommentPeriod): boolean {
  //   return (this.getStatusCode(commentPeriod) === this.OPEN);
  // }
}
