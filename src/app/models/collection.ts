export class Collection {
  _id: string;
  displayName: string;
  date: Date;
  parentType: string;
  type: string;
  status: string;
  agency: string;

  documents: {
    name: string;
    ref: string;
    date: Date;
  }[];

  constructor(collection?: any) {
    this._id         = collection && collection._id         || null;
    this.displayName = collection && collection.displayName || null;
    this.parentType  = collection && collection.parentType  || null;
    this.type        = collection && collection.type        || null;
    this.status      = collection && collection.status      || null;

    if (collection) {
      // Make sure parent type is set if it's null
      if (!this.parentType && this.type) {

        switch (this.type) {
          case 'Permit':
          case 'Certificate':
          case 'Permit Amendment':
          case 'Certificate Amendment':
            this.parentType = 'Authorizations';
            break;

          case 'Inspection Report':
          case 'Inspection Record':
          case 'Order':
            this.parentType = 'Compliance and Enforcement';
            break;

          case 'Annual Report':
          case 'Management Plan':
          case 'Dam Safety Inspection':
          case 'Letter of Assurance':
          case 'Proponent Self Report':
            this.parentType = 'Other';
            break;

          default:
            console.log('Unknown collection type: ' + this.type);
            this.parentType = 'Other';
        }
      }

      // Check status next
      if (this.parentType === 'Authorizations' && !this.status) {
        this.status = (this.type === 'Permit' || this.type === 'Certificate') ? 'Issued' : 'Amended';
      }

      // Set agency
      if (collection.isForMEM) {
        this.agency = 'mem';
      } else if (collection.isForENV) {
        this.agency = 'env';
      } else {
        this.agency = 'eao';
      }

      // Set date
      this.date = collection.date ? new Date(collection.date) : null;

      // Set documents
      this.documents = [];

      if (collection.mainDocument && collection.mainDocument.document) {
        this.documents.push({
          name : collection.mainDocument.document.displayName,
          ref  : this.getURL(collection.mainDocument.document._id),
          date : collection.mainDocument.document.documentDate ? new Date(collection.mainDocument.document.documentDate) : null
        });
      }

      if (collection.otherDocuments && collection.otherDocuments.length > 0) {
        // Sort them
        const otherDocs = collection.otherDocuments.sort((a, b) => { return a.sortOrder - b.sortOrder; });

        // Add them
        otherDocs.forEach(otherDoc => {
          if (otherDoc.document) {
            this.documents.push({
              name : otherDoc.document.displayName,
              ref  : this.getURL(otherDoc.document._id),
              date : otherDoc.document.documentDate ? new Date(otherDoc.document.documentDate) : null
            });
          }
        });
      }
    }
  }

  private getURL(id: string) {
    const host = this.agency === 'eao' ? 'projects.eao.gov.bc.ca' : 'mines.empr.gov.bc.ca';
    return `https://${host}/api/document/${id}/fetch`;
  }
}

export class CollectionsArray {
  items: Collection[];

  constructor(obj?: any) {
    this.items = obj && obj.items || [];
  }

  sort() {
    // Sort collections by descending date, i.e. most recent.
    this.items.sort(function(a: Collection, b: Collection) {
      const aDate = a.date ? a.date.getTime() : 0;
      const bDate = b.date ? b.date.getTime() : 0;
      return bDate - aDate;
    });
  }

  get length() {
    return this.items.length;
  }

  add(collection?: Collection) {
    if (collection) {
      this.items.push(collection);
    }
  }
}

export class CollectionsGroup {
  eao: CollectionsArray;
  env: CollectionsArray;
  mem: CollectionsArray;

  constructor(obj?: any) {
    this.eao = obj && obj.eao || new CollectionsArray();
    this.env = obj && obj.env || new CollectionsArray();
    this.mem = obj && obj.mem || new CollectionsArray();
  }

  sort() {
    this.eao.sort();
    this.mem.sort();
    this.env.sort();
  }
}

export class CollectionsList {
  authorizations: CollectionsGroup;
  compliance: CollectionsArray;
  documents: CollectionsArray;

  constructor(obj?: any) {
    this.authorizations = obj && obj.authorizations || new CollectionsGroup();
    this.compliance     = obj && obj.compliance     || new CollectionsArray();
    this.documents      = obj && obj.documents      || new CollectionsArray();
  }
}


