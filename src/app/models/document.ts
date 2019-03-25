export class Document {
  _id: string;
  _application: string; // objectid -> Application
  _comment: string; // objectid -> Comment
  _decision: string; // objectid -> Decision
  documentFileName: string;
  displayName: string;
  internalURL: string;
  internalMime: string;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this._application = (obj && obj._application) || null;
    this._comment = (obj && obj._comment) || null;
    this._decision = (obj && obj._decision) || null;
    this.documentFileName = (obj && obj.documentFileName) || null;
    this.displayName = (obj && obj.displayName) || null;
    this.internalURL = (obj && obj.internalURL) || null;
    this.internalMime = (obj && obj.internalMime) || null;
  }
}
