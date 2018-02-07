export class CommentPeriod {
  // readonly states = ['OPEN', 'CLOSED', 'FUTURE']; // FUTURE?
  _id: string;
  _addedBy: string;
  _application: string;
  code: string;
  startDate: Date;
  endDate: Date;
  description: string;
  internal: {
    notes: string;
    _addedBy: string;
  };

  status: string;

  constructor(obj?: any) {
    this._id          = obj && obj._id          || null;
    this._addedBy     = obj && obj._addedBy     || null;
    this._application = obj && obj._application || null;
    this.code         = obj && obj.code         || null;
    this.startDate    = obj && obj.startDate    || null;
    this.endDate      = obj && obj.endDate      || null;
    this.description  = obj && obj.description  || null;
    this.internal     = obj && obj.internal     || null;

    const today = new Date();
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);

    if (endDate < today) {
      this.status = 'COMMENTING CLOSED';
    } else if (startDate > today) {
      this.status = 'COMMENTING NOT STARTED';
    } else {
      this.status = 'COMMENTING OPEN';
    }
  }
}
