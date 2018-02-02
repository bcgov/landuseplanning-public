import { Document } from 'app/models/document';

export class Decision {
    _id: string;
    _addedBy: string;
    code: string;
    name: string;
    _documents: string[]; // list of object ids -> Document

    documents: Array<Document>;

    constructor(obj?: any) {
      this._id        = obj && obj._id        || null;
      this._addedBy   = obj && obj._addedBy   || null;
      this.code       = obj && obj.code       || null;
      this.name       = obj && obj.name       || null;
      this._documents = obj && obj._documents || [];

      this.documents = new Array<Document>();
    }
  }
