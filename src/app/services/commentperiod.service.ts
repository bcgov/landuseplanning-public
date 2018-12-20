import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {

  // statuses / query param options
  // use helpers to compare against these
  readonly OPEN = 'OP';
  readonly NOT_OPEN = 'NO';

  private commentPeriod: CommentPeriod = null; // for caching

  constructor(private api: ApiService) { }

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId)
      .map(res => {
        const periods = res.text() ? res.json() : [];
        periods.forEach((obj: any, i: number) => {
          periods[i] = new CommentPeriod(obj);
        });
        return periods;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment period by its id
  getById(periodId: string, forceReload: boolean = false): Observable<CommentPeriod> {
    if (this.commentPeriod && this.commentPeriod._id === periodId && !forceReload) {
      return Observable.of(this.commentPeriod);
    }

    return this.api.getPeriod(periodId)
      .map(res => {
        const periods = res.text() ? res.json() : [];
        // return the first (only) comment period
        return periods.length > 0 ? new CommentPeriod(periods[0]) : null;
      })
      .map((period: CommentPeriod) => {
        if (!period) { return null as CommentPeriod; }

        this.commentPeriod = period;
        return this.commentPeriod;
      })
      .catch(this.api.handleError);
  }

  // returns first period - multiple comment periods are currently not supported
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    return (periods.length > 0) ? periods[0] : null;
  }

  /**
   * Given a comment period, returns status code.
   */
  getStatusCode(commentPeriod: CommentPeriod): string {
    if (commentPeriod && commentPeriod.startDate && commentPeriod.endDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // eg, 'Tue Nov 20 2018 00:00:00 GMT-0800'

      if (commentPeriod.startDate <= today && commentPeriod.endDate >= today) {
        return this.OPEN;
      }
    }

    return this.NOT_OPEN;
  }

  /**
   * Given a status code, returns a user-friendly status string.
   */
  getStatusString(statusCode: string): string {
    if (statusCode) {
      switch (statusCode) {
        case this.OPEN: return 'Commenting Open';
        case this.NOT_OPEN: return 'Commenting Closed';
      }
    }
    return null;
  }

  isOpen(statusCode: string): boolean {
    return (statusCode === this.OPEN);
  }

  isNotOpen(statusCode: string): boolean {
    return (statusCode === this.NOT_OPEN);
  }

}
