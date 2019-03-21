import { Document } from './document';

class Internal {
  email: string;
  phone: string;

  constructor(obj?: any) {
    this.email = (obj && obj.email) || null;
    this.phone = (obj && obj.phone) || null;
  }

  hasData(): boolean {
    return !!this.email || !!this.phone;
  }
}

class CommentAuthor {
  _userId: string; // object id -> User
  orgName: string;
  contactName: string;
  location: string;
  requestedAnonymous: boolean;
  internal: Internal;

  constructor(obj?: any) {
    this._userId = (obj && obj._userId) || null;
    this.orgName = (obj && obj.orgName) || null;
    this.contactName = (obj && obj.contactName) || null;
    this.location = (obj && obj.location) || null;
    this.requestedAnonymous = (obj && obj.requestedAnonymous) || false; // default

    this.internal = new Internal((obj && obj.internal) || null); // must exist (expected by API)
  }

  hasData(): boolean {
    // not including refs
    return (
      !!this.orgName ||
      !!this.contactName ||
      !!this.location ||
      !!this.requestedAnonymous ||
      (this.internal && this.internal.hasData())
    );
  }
}

class Review {
  _reviewerId: string; // object id -> User
  reviewerNotes: string = null;
  reviewerDate: Date = null;

  constructor(obj?: any) {
    this._reviewerId = (obj && obj._reviewerId) || null;

    // replace \\n (JSON format) with newlines
    if (obj && obj.reviewerNotes) {
      this.reviewerNotes = obj.reviewerNotes.replace(/\\n/g, '\n');
    }

    if (obj && obj.reviewerDate) {
      this.reviewerDate = new Date(obj.reviewerDate);
    }
  }

  hasData(): boolean {
    // not including refs
    return !!this.reviewerNotes || !!this.reviewerDate;
  }
}

export class Comment {
  _id: string;
  _addedBy: string; // object id -> User
  _commentPeriod: string; // object id -> CommentPeriod
  commentNumber: number;
  comment: string = null;
  commentAuthor: CommentAuthor;
  review: Review;
  dateAdded: Date = null;
  commentStatus: string;

  // associated data
  documents: Document[] = [];

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._addedBy = (obj && obj._addedBy) || null;
    this._commentPeriod = (obj && obj._commentPeriod) || null;
    this.commentNumber = (obj && obj.commentNumber) || 0;
    this.commentStatus = (obj && obj.commentStatus) || null;

    if (obj && obj.dateAdded) {
      this.dateAdded = new Date(obj.dateAdded);
    }

    this.commentAuthor = new CommentAuthor((obj && obj.commentAuthor) || null); // must exist

    this.review = new Review((obj && obj.review) || null); // must exist

    // replace \\n (JSON format) with newlines
    if (obj && obj.comment) {
      this.comment = obj.comment.replace(/\\n/g, '\n');
    }

    // copy documents
    if (obj && obj.documents) {
      for (const doc of obj.documents) {
        this.documents.push(doc);
      }
    }
  }

  hasData(): boolean {
    // not including refs
    return (
      !!this.commentNumber ||
      !!this.comment ||
      !!this.dateAdded ||
      !!this.commentStatus ||
      (this.commentAuthor && this.commentAuthor.hasData()) ||
      (this.review && this.review.hasData())
    );
  }
}
