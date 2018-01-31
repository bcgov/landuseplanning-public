import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiService } from './api';
import { Decision } from 'app/models/decision';

@Injectable()
export class DecisionService {
  public decision: Decision;

  constructor(private api: ApiService) { }

  // get a specific decision by its id
  getById(decisionId): Observable<Decision> {
    return this.api.getDecision(decisionId)
      .map((res: Response) => {
        const decisions = res.text() ? res.json() : [];
        // return the first (only) decision
        return decisions.length > 0 ? decisions[0] : null;
      })
      .map((decision: Decision) => {
        // if (!decision) { return; }

        // now grab the documents

        // cache decision
        this.decision = decision;

        return this.decision;
      })
      .catch(this.api.handleError);
  }

}
