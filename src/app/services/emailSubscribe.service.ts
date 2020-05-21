import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { EmailSubscribe } from 'app/models/emailSubscribe';

@Injectable()
export class EmailSubscribeService {
  private emailSubscribe: EmailSubscribe = null;

  constructor(
    private api: ApiService,
  ) { }

  // get a specific email by address & project
  /*
  getById(commentId: string, forceReload: boolean = false): Observable<Comment> {
    if (this.comment && this.comment._id === commentId && !forceReload) {
      return Observable.of(this.comment);
    }

    // first get the comment data
    return this.api.getComment(commentId)
    .pipe(
      flatMap(res => {
        let comments = res.body;
        if (!comments || comments.length === 0) {
          return of(null as Comment);
        }
        // Safety check for null documents or an empty array of documents.
        if (comments[0].documents === null || comments[0].documents && comments[0].documents.length === 0) {
          return of(new Comment(comments[0]));
        }
        // now get the rest of the data for this project
        return this._getExtraAppData(new Comment(comments[0]));
      })
    )
    .catch(error => this.api.handleError(error));
  }*/

  add(orig: EmailSubscribe): Observable<EmailSubscribe> {
    // make a (deep) copy of the passed-in comment so we don't change it
    const emailSubscribe = _.cloneDeep(orig);

    // ID must not exist on POST
    delete emailSubscribe._id;

    return this.api.addEmail(emailSubscribe)
      .map((res: EmailSubscribe) => {
        console.log('Email submitted', res);
        return res ? new EmailSubscribe(res) : null;
      })
      .catch(this.api.handleError);
  }

  unsubscribe(emailAddress: string): Observable<EmailSubscribe> {

    return this.api.unsubscribeEmail(emailAddress)
      .map((res: EmailSubscribe) => {
        return res ? new EmailSubscribe(res) : null;
      })
      .catch(this.api.handleError);
  }

  confirm(emailAddress: string, confirmKey: string): Observable<EmailSubscribe> {

    return this.api.confirmEmail(emailAddress, confirmKey)
      .map((res: EmailSubscribe) => {
        return res ? new EmailSubscribe(res) : null;
      })
      .catch(this.api.handleError);
  }

}
