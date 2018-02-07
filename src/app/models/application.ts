import { Organization } from './organization';
import { Document } from './document';
import { CommentPeriod } from './commentperiod';
import { Decision } from './decision';

export class Application {
  _id: string;
  _schemaName: string;
  id: string; // objectid

  _addedBy: string; // objectid -> User
  _updatedBy: string; // FUTURE
  dateAdded: Date;
  dateUpdated: Date;

  agency: string;
  areaHectares: number;
  businessUnit: string;
  cl_files: number[];
  code: string;
  name: string;
  description: string;
  interestID: number;
  internalID: number;
  isPublished: boolean;
  legalDescription: string;
  location: string;
  latitude: number;
  longitude: number;
  mapsheet: string;
  postID: number;
  projectDate: Date;
  _proponent: string; // objectid -> Organization
  purpose: string;
  subpurpose: string;
  region: string;
  stageCode: string;
  status: string;
  tantalisID: number;
  type: string;
  subtype: string;
  _decision: string; // objectid -> Decision

  proponent: Organization;
  documents: Array<Document>;
  currentPeriod: CommentPeriod;
  decision: Decision;

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;
    this._schemaName             = obj && obj._schemaName             || null;
    this.id                      = obj && obj.id                      || null;

    this._addedBy                = obj && obj._addedBy                || null;
    this._updatedBy              = obj && obj._updatedBy              || null;
    this.dateAdded               = obj && obj.dateAdded               || null;
    this.dateUpdated             = obj && obj.dateUpdated             || null;

    this.agency                  = obj && obj.agency                  || null;
    this.areaHectares            = obj && obj.areaHectares            || null;
    this.businessUnit            = obj && obj.businessUnit            || null;
    this.cl_files                = obj && obj.cl_files                || null;
    this.code                    = obj && obj.code                    || null;
    this.name                    = obj && obj.name                    || null;
    this.description             = obj && obj.description             || null;
    this.interestID              = obj && obj.interestID              || 0;
    this.internalID              = obj && obj.internalID              || 0;
    this.isPublished             = obj && obj.isPublished             || null;
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.location                = obj && obj.location                || '-';
    this.latitude                = obj && obj.lat                     || 0;
    this.longitude               = obj && obj.lon                     || 0;
    this.mapsheet                = obj && obj.mapsheet                || null;
    this.postID                  = obj && obj.postID                  || null;
    this.projectDate             = obj && obj.projectDate             || null;
    this._proponent              = obj && obj._proponent              || null;
    this.purpose                 = obj && obj.purpose                 || '-';
    this.subpurpose              = obj && obj.subpurpose              || '-';
    this.region                  = obj && obj.region                  || '-';
    this.stageCode               = obj && obj.stageCode               || '-';
    this.status                  = obj && obj.status                  || '-';
    this.tantalisID              = obj && obj.tantalisID              || 0;
    this.type                    = obj && obj.type                    || '-';
    this.subtype                 = obj && obj.subtype                 || '-';
    this._decision               = obj && obj._decision               || null;

    this.proponent = null;
    this.documents = [];
    this.currentPeriod = null;
    this.decision = null;
  }
}
