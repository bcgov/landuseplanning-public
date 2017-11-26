export class News {
  _id: number;
  headline: string;
  content: string;
  project: string;
  priority: number;
  type: string;
  dateUpdated: string;
  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.headline = obj && obj.headline || null;
    this.content = obj && obj.content || null;
    this.project = obj && obj.project || null;
    this.priority = obj && obj.priority || null;
    this.type = obj && obj.type || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
  }
}
