import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentPeriodService {
  commentStatuses = {};

  constructor(private api: ApiService) {
    this.commentStatuses['NOT_STARTED'] = 'Commenting Not Started';
    this.commentStatuses['NOT_OPEN'] = 'Not Open For Commenting';
    this.commentStatuses['CLOSED'] = 'Commenting Closed';
    this.commentStatuses['OPEN'] = 'Commenting Open';
  }

  // get all comment periods for the specified application id
  getAllByApplicationId(appId: string): Observable<CommentPeriod[]> {
    return this.api.getPeriodsByAppId(appId)
      .map((res: Response) => {
        const periods = res.text() ? res.json() : [];
        periods.forEach((period, i) => {
          periods[i] = new CommentPeriod(period);
        });
        return periods;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment period by its id
  getById(periodId: string): Observable<CommentPeriod> {
    return this.api.getPeriod(periodId)
      .map((res: Response) => {
        const periods = res.text() ? res.json() : [];
        // return the first (only) comment period
        return periods.length > 0 ? new CommentPeriod(periods[0]) : null;
      })
      .catch(this.api.handleError);
  }

  // returns current (latest) period
  // assumes if there's an open period, there isn't also future one
  getCurrent(periods: Array<CommentPeriod>): CommentPeriod {
    const sortedPeriods = periods.sort((a, b) => a.startDate < b.startDate ? 1 : 0);
    return (sortedPeriods.length > 0) ? sortedPeriods[0] : null;
  }

  isOpen(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses['OPEN']);
  }

  isOpenNotStarted(period: CommentPeriod): boolean {
    return (this.getStatus(period) === this.commentStatuses['OPEN'] ||
      this.getStatus(period) === this.commentStatuses['NOT_STARTED']);
  }

  getStatus(period: CommentPeriod): string {
    if (!period) {
      return this.commentStatuses['NOT_OPEN'];
    }

    if (!period.startDate || !period.endDate) {
      return null; // error
    }

    const today = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (endDate < today) {
      return this.commentStatuses['CLOSED'];
    } else if (startDate > today) {
      return this.commentStatuses['NOT_STARTED'];
    } else {
      return this.commentStatuses['OPEN'];
    }
  }
}
