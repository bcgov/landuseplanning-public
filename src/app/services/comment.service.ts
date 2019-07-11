import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

import { ApiService } from './api';
import { Comment } from 'app/models/comment';

@Injectable()
export class CommentService {
  private comment: Comment = null;

  constructor(
    private api: ApiService,
  ) { }

  // get count of projects
  getCountById(commentPeriodId): Observable<number> {
    return this.api.getCountCommentsById(commentPeriodId)
      .map(res => {
        // retrieve the count from the response headers
        return parseInt(res.headers.get('x-total-count'), 10);
      })
      .catch(this.api.handleError);
  }

  // get all comments for the specified comment period id
  // (without documents)
  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, getCount: boolean = false) {
    return this.api.getCommentsByPeriodId(pageNum ? pageNum - 1 : pageNum, pageSize, getCount, periodId)
      .map(res => {
        const comments = res.text() ? res.json() : [];
        comments.forEach((comment, i) => {
          comments[i] = new Comment(comment);
        });
        const commentsDataSet = {
          totalCount: res.headers.get('x-total-count'),
          currentComments: comments as Comment[]
        };
        return commentsDataSet;
      })
      .catch(this.api.handleError);
  }

  // get a specific comment by its id
  // (including documents)
  getById(commentId: string, forceReload: boolean = false): Observable<Comment> {
    if (this.comment && this.comment._id === commentId && !forceReload) {
      return Observable.of(this.comment);
    }

    // first get the comment data
    return this.api.getComment(commentId)
      .map(res => {
        const comments = res.text() ? res.json() : [];
        // return the first (only) comment
        return comments.length > 0 ? new Comment(comments[0]) : null;
      })
      // .mergeMap(comment => {
      //   if (!comment) { return Observable.of(null as Comment); }

      //   // now get the comment documents
      //   // const promise = this.documentService.getAllByCommentId(comment._id)
      //   //   .toPromise()
      //   //   .then(documents => comment.documents = documents);

      //   return Promise.resolve(promise).then(() => {
      //     this.comment = comment;
      //     return this.comment;
      //   });
      // })
      .catch(this.api.handleError);
  }

  add(orig: Comment): Observable<Comment> {
    // make a (deep) copy of the passed-in comment so we don't change it
    const comment = _.cloneDeep(orig);

    // ID must not exist on POST
    delete comment._id;

    // don't send documents
    // delete comment.documents;

    // // replace newlines with \\n (JSON format)
    // if (comment.comment) {
    //   comment.comment = comment.comment.replace(/\n/g, '\\n');
    // }
    // if (comment.review && comment.review.reviewerNotes) {
    //   comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\n/g, '\\n');
    // }

    return this.api.addComment(comment)
      .map(res => {
        const c = res.text() ? res.json() : null;
        return c ? new Comment(c) : null;
      })
      .catch(this.api.handleError);
  }
}
