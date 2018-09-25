export class CommentPeriod {
  _id: string;
  _addedBy: string;
  _application: string;
  code: string;
  startDate: Date;
  endDate: Date;

  constructor(obj?: any) {
    this._id          = obj && obj._id          || null;
    this._addedBy     = obj && obj._addedBy     || null;
    this._application = obj && obj._application || null;
    this.code         = obj && obj.code         || null;
    this.startDate    = obj && obj.startDate    || null;
    this.endDate      = obj && obj.endDate      || null;
  }
}
