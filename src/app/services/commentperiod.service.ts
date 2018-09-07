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
  readonly NOT_STARTED = 'NS';
  readonly NOT_OPEN = 'NO';
  readonly CLOSED = 'CL';
  readonly OPEN = 'OP';

  private commentPeriodStatuses: Array<string> = []; // use helper to get these
  private commentPeriod: CommentPeriod = null; // for caching

  constructor(private api: ApiService) {
    // user-friendly strings for display
    this.commentPeriodStatuses[this.NOT_STARTED] = 'Commenting Not Started';
    this.commentPeriodStatuses[this.NOT_OPEN] = 'Not Open For Commenting';
    this.commentPeriodStatuses[this.CLOSED] = 'Commenting Closed';
    this.commentPeriodStatuses[this.OPEN] = 'Commenting Open';
  }

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId)
      .map(res => {
        const periods = res.text() ? res.json() : [];
        periods.forEach((period, i) => {
          periods[i] = new CommentPeriod(period);
        });
        return periods;
      })
      .map((periods: CommentPeriod[]) => {
        if (periods.length === 0) {
          return [] as CommentPeriod[];
        }

        // replace \\n (JSON format) with newlines in each comment period
        periods.forEach((period, i) => {
          if (periods[i].description) {
            periods[i].description = periods[i].description.replace(/\\n/g, '\n');
          }
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

        // replace \\n (JSON format) with newlines
        if (period.description) {
          period.description = period.description.replace(/\\n/g, '\n');
        }

        this.commentPeriod = period;
        return this.commentPeriod;
      })
      .catch(this.api.handleError);
  }

  // returns first period - multiple comment periods are currently not suported
  getCurrent(periods: CommentPeriod[]): CommentPeriod {
    return (periods.length > 0) ? periods[0] : null;
  }

  /**
   * Given a comment period, returns status abbreviation.
   */
  getStatusCode(commentPeriod: CommentPeriod): string {
    if (!commentPeriod || !commentPeriod.startDate || !commentPeriod.endDate) {
      return this.NOT_OPEN;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date(commentPeriod.startDate);
    const endDate = new Date(commentPeriod.endDate);

    if (endDate < today) {
      return this.CLOSED;
    } else if (startDate > today) {
      return this.NOT_STARTED;
    } else {
      return this.OPEN;
    }
  }

  /**
     * Given a status code, returns user-friendly status string.
     */
  getStatusString(statusCode: string): string {
    switch (statusCode) {
      case this.NOT_STARTED: return this.commentPeriodStatuses[this.NOT_STARTED];
      case this.NOT_OPEN: return this.commentPeriodStatuses[this.NOT_OPEN];
      case this.CLOSED: return this.commentPeriodStatuses[this.CLOSED];
      case this.OPEN: return this.commentPeriodStatuses[this.OPEN];
    }
    return null;
  }

  isNotOpen(commentPeriod: CommentPeriod): boolean {
    return (this.getStatusCode(commentPeriod) === this.NOT_OPEN);
  }

  isClosed(commentPeriod: CommentPeriod): boolean {
    return (this.getStatusCode(commentPeriod) === this.CLOSED);
  }

  isNotStarted(commentPeriod: CommentPeriod): boolean {
    return (this.getStatusCode(commentPeriod) === this.NOT_STARTED);
  }

  isOpen(commentPeriod: CommentPeriod): boolean {
    return (this.getStatusCode(commentPeriod) === this.OPEN);
  }
}
