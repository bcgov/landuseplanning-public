import { Document } from './document';
import { CommentPeriod } from './commentperiod';
import { Decision } from './decision';
import { Feature } from './feature';
import * as _ from 'lodash';

export class Application {
  _id: string;

  // the following are retrieved from the API
  agency: string;
  areaHectares: number;
  businessUnit: string;
  centroid: Array<number> = []; // [lng, lat]
  cl_file: number;
  client: string;
  description: string;
  legalDescription: string;
  location: string;
  name: string; // MAY BE OBSOLETE
  publishDate: Date;
  purpose: string;
  status: string;
  subpurpose: string;
  subtype: string;
  tantalisID: number;
  tenureStage: string;
  type: string;

  region: string; // region code derived from Business Unit
  appStatus: string; // user-friendly application status
  cpStatus: string; // user-friendly comment period status

  // TODO: delete isMatches (everywhere) when API performs filtering
  isMatches = true; // whether this application matches current filters
  isVisible = true; // whether this application is visible on map
                    // default is true - for apps without centroid (ie, no features)
  isLoaded = false; // whether this application is loaded in list

  // associated data
  documents: Array<Document> = [];
  currentPeriod: CommentPeriod = null;
  decision: Decision = null;
  features: Array<Feature> = [];

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;
    this.agency                  = obj && obj.agency                  || null;
    this.areaHectares            = obj && obj.areaHectares            || null;
    this.businessUnit            = obj && obj.businessUnit            || null;
    this.cl_file                 = obj && obj.cl_file                 || null;
    this.client                  = obj && obj.client                  || null;
    this.description             = obj && obj.description             || null;
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.location                = obj && obj.location                || null;
    this.name                    = obj && obj.name                    || null;
    this.publishDate             = obj && obj.publishDate             || null;
    this.purpose                 = obj && obj.purpose                 || null;
    this.status                  = obj && obj.status                  || null;
    this.subpurpose              = obj && obj.subpurpose              || null;
    this.subtype                 = obj && obj.subtype                 || null;
    this.tantalisID              = obj && obj.tantalisID              || null; // not zero
    this.tenureStage             = obj && obj.tenureStage             || null;
    this.type                    = obj && obj.type                    || null;

    this.region                  = obj && obj.region                  || null;
    this.appStatus               = obj && obj.appStatus               || null;
    this.cpStatus                = obj && obj.cpStatus                || null;

    if (obj && obj.centroid) {
      obj.centroid.forEach(num => {
        this.centroid.push(num);
      });
    }
  }
}
