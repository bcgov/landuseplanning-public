import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Decision } from 'app/models/decision';
import { DocumentService } from './document.service';

@Injectable()
export class DecisionService {
  private decision: Decision = null;

  constructor(private api: ApiService, private documentService: DocumentService) {}

  // get decision for the specified application id
  getByApplicationId(appId: string, forceReload: boolean = false): Observable<Decision> {
    if (this.decision && this.decision._application === appId && !forceReload) {
      return of(this.decision);
    }

    // first get the decision data
    return this.api.getDecisionByAppId(appId).pipe(
      map((res: Decision[]) => {
        if (!res || res.length === 0) {
          return null as Decision;
        }

        // return the first (only) decision
        return new Decision(res[0]);
      }),
      mergeMap(decision => {
        if (!decision) {
          return of(null as Decision);
        }

        // now get the decision documents
        const promise = this.documentService
          .getAllByDecisionId(decision._id)
          .toPromise()
          .then(documents => (decision.documents = documents));

        return Promise.resolve(promise).then(() => {
          this.decision = decision;
          return decision;
        });
      }),
      catchError(this.api.handleError)
    );
  }

  // get a specific decision by its id
  getById(decisionId: string, forceReload: boolean = false): Observable<Decision> {
    if (this.decision && this.decision._id === decisionId && !forceReload) {
      return of(this.decision);
    }

    // first get the decision data
    return this.api.getDecision(decisionId).pipe(
      map((res: Decision[]) => {
        if (!res || res.length === 0) {
          return null as Decision;
        }
        // return the first (only) decision
        return new Decision(res[0]);
      }),
      mergeMap(decision => {
        if (!decision) {
          return of(null as Decision);
        }

        // now get the decision documents
        const promise = this.documentService
          .getAllByDecisionId(decision._id)
          .toPromise()
          .then(documents => (decision.documents = documents));

        return Promise.resolve(promise).then(() => {
          this.decision = decision;
          return decision;
        });
      }),
      catchError(this.api.handleError)
    );
  }
}
