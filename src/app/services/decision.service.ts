import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Decision } from 'app/models/decision';
import { ApiService } from './api';
import { DocumentService } from './document.service';

@Injectable()
export class DecisionService {
  public decision: Decision;

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
        return decisions.length > 0 ? decisions[0] : null;
      })
      .map((decision: Decision) => {
        if (!decision) { return; }

        // cache decision
        this.decision = decision;

        // now grab the decision documents
        this.documentService.getAllByDecision(decision)
          .subscribe(
          documents => {
            documents.forEach(document => {
              this.decision.documents.push(document);
            });
          },
          error => console.log(error)
          );

        return this.decision;
      })
      .catch(this.api.handleError);
  }
}
