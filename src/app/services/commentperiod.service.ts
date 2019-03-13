import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  // statuses / query param options
  // use helpers to compare against these
  readonly OPEN = 'OP';
  readonly NOT_OPEN = 'NO';

  private commentPeriod: CommentPeriod = null; // for caching

  constructor(private api: ApiService) {}

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId).pipe(
      map((res: CommentPeriod[]) => {
        if (!res || res.length === 0) {
          return [] as CommentPeriod[];
        }

        const periods: CommentPeriod[] = [];
        res.forEach(cp => {
          periods.push(new CommentPeriod(cp));
        });
        return periods;
      }),
      catchError(this.api.handleError)
    );
  }

  // get a specific comment period by its id
  getById(periodId: string, forceReload: boolean = false): Observable<CommentPeriod> {
    if (this.commentPeriod && this.commentPeriod._id === periodId && !forceReload) {
      return of(this.commentPeriod);
    }

    return this.api.getPeriod(periodId).pipe(
      map((res: CommentPeriod[]) => {
        if (!res || res.length === 0) {
          return null as CommentPeriod;
        }

        // return the first (only) comment period
        this.commentPeriod = new CommentPeriod(res[0]);
        return this.commentPeriod;
      }),
      catchError(this.api.handleError)
    );
  }

  // returns first period - multiple comment periods are currently not supported
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    return periods.length > 0 ? periods[0] : null;
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
        case this.OPEN:
          return 'Commenting Open';
        case this.NOT_OPEN:
          return 'Commenting Closed';
      }
    }
    return null as string;
  }

  isOpen(statusCode: string): boolean {
    return statusCode === this.OPEN;
  }

  isNotOpen(statusCode: string): boolean {
    return statusCode === this.NOT_OPEN;
  }
}
