import * as _ from 'lodash';
import { CollectionsList } from './collection';

export class Project {
  _id: string;
  code: string;
  name: string;
  description: string;
  subtitle: string;
  type: string;
  status: string;
  operator: string;
  memPermitID: string;
  tailingsImpoundments: number;
  commodities: string[];
  commodityType: string;
  commodity: string;
  longitude: number;
  latitude: number;
  morePermitsLinkYear: string;
  morePermitsLink: string;
  moreInspectionsLink: string;
  moreInspectionsLinkYear: string;
  epicProjectCodes: string[];

  collections: CollectionsList;

  ownershipData: {
    sharePercent: number;
    organization: string;
  };

  content: {
    type: string;
    page: string;
    html: string;
  }[];

  private _activities: {
    order: number;  // display order, not any business rules order
    status: string;  // one of: 'Active', 'Inactive', 'Pending', 'Complete', 'Suspended', 'N/A', ''
    name: string;
    cssClass?: string;
  }[];
  get activities() {
    return this._activities;
  }
  set activities(newValue) {
    this._activities = newValue;

    // sort by display order, make sure the original array is left unmodified
    if (newValue) {
      this.sortedActivities = newValue.slice().sort((a, b) => a.order - b.order);
    } else {
      this.sortedActivities = [];
    }
  }

  // same as `activities` but sorted by display order
  sortedActivities: {
    order: number;
    status: string;
    name: string;
    cssClass?: string;
  }[];

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
    this.code                    = obj && obj.code                    || null;
    this.commodityType           = obj && obj.commodityType           || null;
    this.commodity               = obj && obj.commodity               || null;
    this.memPermitID             = obj && obj.memPermitID             || null;
    this.name                    = obj && obj.name                    || null;
    this.description             = obj && obj.description             || null;
    this.subtitle                = obj && obj.subtitle                || null;
    this.type                    = obj && obj.type                    || null;
    this.status                  = obj && obj.currentPhaseName        || null;
    this.tailingsImpoundments    = obj && obj.tailingsImpoundments    || 0;
    this.longitude               = obj && obj.lon                     || 0;
    this.latitude                = obj && obj.lat                     || 0;
    this.morePermitsLinkYear     = obj && obj.morePermitsLinkYear     || null;
    this.morePermitsLink         = obj && obj.morePermitsLink         || null;
    this.moreInspectionsLink     = obj && obj.moreInspectionsLink     || null;
    this.moreInspectionsLinkYear = obj && obj.moreInspectionsLinkYear || null;
    this.epicProjectCodes        = obj && obj.epicProjectCodes        || [];
    this.content                 = obj && obj.content                 || [];
    this.externalLinks           = obj && obj.externalLinks           || [];
    this.ownershipData           = obj && obj.ownershipData           || [];
    this.collections             = obj && obj.collections             || null;

    // Get the operator from the proponent.
    this.operator = obj && obj.proponent ? obj.proponent.name : '';

    // Commodities come from commodity
    this.commodities = obj && obj.commodity ? (<string>obj.commodity).split(',').map(x => {
      const y = x.trim();
      const commodity = y[0].toUpperCase() + y.substr(1).toLowerCase();
      return commodity;
    }) : [];

    // process incoming activity objects
    this.activities = obj && obj.activities ? obj.activities.map(x => this.parseActivity(x)) : [];
  }

  getContent(page: string, type: string): string {
    try {
      const entry = this.content.find(x => x.type === type && x.page === page);
      return entry.html;
    } catch (e) {
      return '';
    }
  }

  // add display fields; e.g. cssClass
  private parseActivity(activity): any {
    activity.cssClass = this.cssClass(activity);
    return activity;
  }

  private cssClass(activity): string {
    try {
      const value = (<string>activity.status || 'N/A').replace('N/A', 'NA').toLowerCase();
      return value;
    } catch (e) {
      return '';
    }
  }
}
