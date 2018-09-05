import { Document } from 'app/models/document';

export class Decision {
  _id: string;
  _addedBy: string; // objectid -> User
  _application: string; // objectid -> Application
  code: string;
  name: string;
  description: string;

  documents: Array<Document>;

  constructor(obj?: any) {
    this._id          = obj && obj._id          || null;
    this._addedBy     = obj && obj._addedBy     || null;
    this._application = obj && obj._application || null;
    this.code         = obj && obj.code         || null;
    this.name         = obj && obj.name         || null;
    this.description  = obj && obj.description  || null;

    this.documents = [];
  }
}
