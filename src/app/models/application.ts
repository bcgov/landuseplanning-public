import * as _ from 'lodash';
import { CollectionsList } from './collection';

export class Application {
  _id: string;
  _schemaName: string;
  id: string; // objectid

  addedBy: string; // objectid -> User
  updatedBy: string; // objectid -> User
  dateAdded: Date;
  dateUpdated: Date;

  agency: string;
  areaHectares: number;
  businessUnit: string;
  cl_file: string;
  code: string;
  name: string;
  description: string;
  interestID: string; // should be number?
  internalID: string; // should be number?
  isPublished: boolean;
  legalDescription: string;
  location: string;
  latitude: number;
  longitude: number;
  mapsheet: string;
  postID: number;
  projectDate: Date;
  proponent: string; // objectid -> Organization
  purpose: string;
  subpurpose: string;
  region: string;
  stageCode: string;
  status: string;
  tantalisID: string; // should be number?
  type: string;
  subtype: string;

  // subtitle: string;
  // memPermitID: string;
  // tailingsImpoundments: number;
  // commodities: string[];
  // commodityType: string;
  // commodity: string;
  // morePermitsLinkYear: string;
  // morePermitsLink: string;
  // moreInspectionsLink: string;
  // moreInspectionsLinkYear: string;
  // epicProjectCodes: string[];

  // collections: CollectionsList;

  operator: string;

  // ownershipData: {
  //   sharePercent: number;
  //   organization: string;
  // };

  // content: {
  //   type: string;
  //   page: string;
  //   html: string;
  // }[];

  // private _activities: {
  //   order: number;  // display order, not any business rules order
  //   status: string;  // one of: 'Active', 'Inactive', 'Pending', 'Complete', 'Suspended', 'N/A', ''
  //   name: string;
  //   cssClass?: string;
  // }[];
  // get activities() {
  //   return this._activities;
  // }
  // set activities(newValue) {
  //   this._activities = newValue;

  //   // sort by display order, make sure the original array is left unmodified
  //   if (newValue) {
  //     this.sortedActivities = newValue.slice().sort((a, b) => a.order - b.order);
  //   } else {
  //     this.sortedActivities = [];
  //   }
  // }

  // same as `activities` but sorted by display order
  // sortedActivities: {
  //   order: number;
  //   status: string;
  //   name: string;
  //   cssClass?: string;
  // }[];

  private _externalLinks: {
    link: string;
    title: string;
    order: number;
  }[];
  get externalLinks() {
    return this._externalLinks;
  }
  set externalLinks(newValue) {
    this._externalLinks = newValue;

    // filter out duplicate links
    if (newValue) {
      this.sortedLinks = _.uniqBy(newValue, 'link').sort((a, b) => a.order - b.order);
    } else {
      this.sortedLinks = [];
    }
  }

  // same as `externalLinks` but without duplicate links and sorted by `order`
  sortedLinks: {
    link: string;
    title: string;
    order: number;
  }[];

  constructor(obj?: any) {
    this._id                     = obj && obj._id                     || null;
    this._schemaName             = obj && obj._schemaName             || null;
    this.id                      = obj && obj.id                      || null;

    this.addedBy                 = obj && obj.addedBy                 || null;
    this.updatedBy               = obj && obj.updatedBy               || null;
    this.dateAdded               = obj && obj.dateAdded               || null;
    this.dateUpdated             = obj && obj.dateUpdated             || null;

    this.agency                  = obj && obj.agency                  || null;
    this.areaHectares            = obj && obj.areaHectares            || null;
    this.businessUnit            = obj && obj.businessUnit            || null;
    this.cl_file                 = obj && obj.cl_file                 || null;
    this.code                    = obj && obj.code                    || null;
    this.name                    = obj && obj.name                    || null;
    this.description             = obj && obj.description             || null;
    this.interestID              = obj && obj.interestID              || null;
    this.internalID              = obj && obj.internalID              || null;
    this.isPublished             = obj && obj.isPublished             || null;
    this.legalDescription        = obj && obj.legalDescription        || null;
    this.location                = obj && obj.location                || null;
    this.latitude                = obj && obj.lat                     || 0;
    this.longitude               = obj && obj.lon                     || 0;
    this.mapsheet                = obj && obj.mapsheet                || null;
    this.postID                  = obj && obj.postID                  || null;
    this.projectDate             = obj && obj.projectDate             || null;
    this.proponent               = obj && obj.proponent               || null;
    this.purpose                 = obj && obj.purpose                 || null;
    this.subpurpose              = obj && obj.subpurpose              || null;
    this.region                  = obj && obj.region                  || null;
    this.stageCode               = obj && obj.stageCode               || null;
    this.status                  = obj && obj.status                  || null;
    this.tantalisID              = obj && obj.tantalisID              || null;
    this.type                    = obj && obj.type                    || null;
    this.subtype                 = obj && obj.subtype                 || null;

    // this.collections             = obj && obj.collections             || null;

    // get the operator from the proponent
    this.operator = (obj && obj.proponent && obj.proponent.name) ? obj.proponent.name : '';

    // commodities come from commodity
    // this.commodities = obj && obj.commodity ? (<string>obj.commodity).split(',').map(x => {
    //   const y = x.trim();
    //   const commodity = y[0].toUpperCase() + y.substr(1).toLowerCase();
    //   return commodity;
    // }) : [];

    // process incoming activity objects
    // this.activities = obj && obj.activities ? obj.activities.map(x => this.parseActivity(x)) : [];
  }

  // getContent(page: string, type: string): string {
  //   try {
  //     const entry = this.content.find(x => x.type === type && x.page === page);
  //     return entry.html;
  //   } catch (e) {
  //     return '';
  //   }
  // }

  // add display fields; e.g. cssClass
  // private parseActivity(activity): any {
  //   activity.cssClass = this.cssClass(activity);
  //   return activity;
  // }

  // private cssClass(activity): string {
  //   try {
  //     const value = (<string>activity.status || 'N/A').replace('N/A', 'NA').toLowerCase();
  //     return value;
  //   } catch (e) {
  //     return '';
  //   }
  // }
}
