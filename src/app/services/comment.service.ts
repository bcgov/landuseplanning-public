import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from './api';
import { CommentPeriodService } from './commentperiod.service';
import { DocumentService } from './document.service';
import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentperiod';

@Injectable()
export class CommentService {
  private comment: Comment = null;

  constructor(
    private api: ApiService,
    private commentPeriodService: CommentPeriodService,
    private documentService: DocumentService
  ) {}

  // get all comments for the specified application id
  // (without documents)
  getAllByApplicationId(appId: string): Observable<Comment[]> {
    // first get the comment periods
    return this.commentPeriodService.getAllByApplicationId(appId).pipe(
      mergeMap((res: CommentPeriod[]) => {
        if (!res || res.length === 0) {
          return of([] as Comment[]);
        }

        const promises: Array<Promise<any>> = [];

        // now get the comments for all periods
        res.forEach(period => {
          promises.push(this.getAllByPeriodId(period._id).toPromise());
        });

        return Promise.all(promises).then((allComments: Comment[][]) => {
          return _.flatten(allComments);
        });
      }),
      catchError(this.api.handleError)
    );
  }

  // get all comments for the specified comment period id
  // (without documents)
  getAllByPeriodId(periodId: string): Observable<Comment[]> {
    return this.api.getCommentsByPeriodId(periodId).pipe(
      map((res: Comment[]) => {
        if (!res || res.length === 0) {
          return [] as Comment[];
        }

        const comments: Comment[] = [];
        res.forEach(comment => {
          comments.push(new Comment(comment));
        });
        return comments;
      }),
      catchError(this.api.handleError)
    );
  }

  // get a specific comment by its id
  // (including documents)
  getById(commentId: string, forceReload: boolean = false): Observable<Comment> {
    if (this.comment && this.comment._id === commentId && !forceReload) {
      return of(this.comment);
    }

    // first get the comment data
    return this.api.getComment(commentId).pipe(
      map((res: Comment[]) => {
        if (!res || res.length === 0) {
          return null as Comment;
        }
        // return the first (only) comment
        return new Comment(res[0]);
      }),
      mergeMap(comment => {
        if (!comment) {
          return of(null as Comment);
        }

        // now get the comment documents
        const promise = this.documentService
          .getAllByCommentId(comment._id)
          .toPromise()
          .then(documents => (comment.documents = documents));

        return Promise.resolve(promise).then(() => {
          this.comment = comment;
          return this.comment;
        });
      }),
      catchError(this.api.handleError)
    );
  }

  add(orig: Comment): Observable<Comment> {
    // make a (deep) copy of the passed-in comment so we don't change it
    const comment = _.cloneDeep(orig);

    // ID must not exist on POST
    delete comment._id;

    // don't send documents
    delete comment.documents;

    // replace newlines with \\n (JSON format)
    if (comment.comment) {
      comment.comment = comment.comment.replace(/\n/g, '\\n');
    }
    if (comment.review && comment.review.reviewerNotes) {
      comment.review.reviewerNotes = comment.review.reviewerNotes.replace(/\n/g, '\\n');
    }

    return this.api.addComment(comment).pipe(
      map((res: Comment) => {
        if (!res) {
          return null as Comment;
        }
        return new Comment(res);
      }),
      catchError(this.api.handleError)
    );
  }
}
