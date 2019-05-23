import { Project } from './project';

export class News {
  _id: number;
  headline: string;
  content: string;
  project: Project;
  priority: number;
  type: string;
  dateAdded: string;
  dateUpdated: string;
  contentUrl: string;
  documentUrl: string;
  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.headline = obj && obj.headline || null;
    this.content = obj && obj.content || null;
    this.project = obj && obj.project || null;
    this.priority = obj && obj.priority || null;
    this.type = obj && obj.type || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.contentUrl = obj && obj.contentUrl || null;
    this.documentUrl = obj && obj.documentUrl || null;
  }
}
