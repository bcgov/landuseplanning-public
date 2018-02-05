import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Decision } from 'app/models/decision';
import { ApiService } from './api';
import { DocumentService } from './document.service';

@Injectable()
export class DecisionService {
  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }

  // get a specific decision by its id
  getById(decisionId): Observable<Decision> {
    return this.api.getDecision(decisionId)
      .map((res: Response) => {
        const decisions = res.text() ? res.json() : [];
        // return the first (only) decision
        return decisions.length > 0 ? new Decision(decisions[0]) : null;
      })
      .map((decision: Decision) => {
        if (!decision) { return; }

        // now grab the decision documents
        this.documentService.getAllByDecision(decision)
          .subscribe(
          documents => {
            documents.forEach(document => {
              decision.documents.push(document);
            });
          },
          error => console.log(error)
          );

        return decision;
      })
      .catch(this.api.handleError);
  }
}
