import { Project } from './project';
import { CommentPeriod } from './commentperiod';

export class News {
  _id: number;
  headline: string;
  content: string;
  active: boolean;
  project: Project;
  pcp: string;
  dateAdded: string;
  dateUpdated: string;
  contentUrl: string;
  documentUrl: string;
  documentUrlText: string;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.headline = obj && obj.headline || null;
    this.content = obj && obj.content || null;
    this.project = obj && obj.project || null;
    this.pcp = obj && obj.pcp || null;
    this.active = obj && obj.active || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.documentUrlText = obj && obj.documentUrlText || null;
    this.contentUrl = obj && obj.contentUrl || null;
    this.documentUrl = obj && obj.documentUrl || null;
  }
}
