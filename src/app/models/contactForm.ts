export class ContactForm {
  _id: string;
  project: string;
  name: string;
  email: string;
  message: string;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.name = obj && obj.name || null;
    this.project = obj && obj.project || null;
    this.email = obj && obj.email || null;
    this.message = obj && obj.message || null;
  }
}
