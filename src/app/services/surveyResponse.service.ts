import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { SurveyResponse } from 'app/models/surveyResponse';
import { DocumentService } from './document.service';

@Injectable()
export class SurveyResponseService {
  private surveyResponse: SurveyResponse = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService,
  ) { }

  add(orig: SurveyResponse): Observable<SurveyResponse> {
    // make a (deep) copy of the passed-in comment so we don't change it
    const surveyResponse = _.cloneDeep(orig);

    // ID must not exist on POST
    delete surveyResponse._id;

    return this.api.addSurveyResponse(surveyResponse)
      .map((res: SurveyResponse) => {
        return res ? new SurveyResponse(res) : null;
      })
      .catch(this.api.handleError);
  }
}
