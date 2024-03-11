export class Project {
  // the following are retrieved from the API.
  _id: string;
  existingLandUsePlans: String;
  centroid: Array<number> = [];
  description: String;
  details: String;
  engagementStatus: String;
  logos: ProjectLogo[];
  backgroundInfo: String;
  engagementLabel: String;
  engagementInfo: String;
  documentInfo: String;
  overlappingRegionalDistricts: String;
  name: String;
  projectLead: any;
  partner: String;
  region: String;
  projectDirector: any;
  agreements: { agreementName: string, agreementUrl: string }[];
  shapefiles: { shapefileId: string, documentFileName: string }[];

  // Everything else
  addedBy: String;
  existingLandUsePlanURLs: String;
  code: String;
  commodity: String;
  currentPhaseName: string;
  dateAdded: String;
  dateUpdated: String;
  duration: String;
  eaoMember: String;
  epicProjectID: Number;
  fedElecDist: String;
  isTermsAgreed: Boolean;
  overallProgress: Number;
  primaryContact: String;
  proMember: String;
  provElecDist: String;
  shortName: String;
  projectPhase: String;
  substitution: Boolean;
  updatedBy: String;
  operational: any;
  nature: any;
  commentPeriodForBanner: any;
  activitiesAndUpdatesEnabled: boolean;
  contactFormEnabled: boolean;
  contactFormEmails: string[];

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  isMatches = true;
  isVisible = true;
  isLoaded = false;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.operational = obj && obj.operational || null;
    this.nature = obj && obj.nature || null;
    this.existingLandUsePlans = obj && obj.existingLandUsePlans || null;
    this.description = obj && obj.description || null;
    this.details = obj && obj.details || null;
    this.engagementStatus = obj && obj.engagementStatus || null;
    this.logos = obj && obj.logos || null;
    this.backgroundInfo = obj && obj.backgroundInfo || null;
    this.engagementLabel = obj && obj.engagementLabel || null;
    this.engagementInfo = obj && obj.engagementInfo || null;
    this.documentInfo = obj && obj.documentInfo || null;
    this.overlappingRegionalDistricts = obj && obj.overlappingRegionalDistricts || null;
    this.name = obj && obj.name || null;
    this.projectLead = obj && obj.projectLead || null;
    this.partner = obj && obj.partner || null;
    this.region = obj && obj.region || null;
    this.projectDirector = obj && obj.projectDirector || null;
    this.agreements = obj && obj.agreements || null;
    this.shapefiles = obj && obj.shapefiles || [];
    this.addedBy = obj && obj.addedBy || null;
    this.existingLandUsePlanURLs = obj && obj.existingLandUsePlanURLs || null;
    this.code = obj && obj.code || null;
    this.commodity = obj && obj.commodity || null;
    this.currentPhaseName = obj && obj.currentPhaseName || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.duration = obj && obj.duration || null;
    this.eaoMember = obj && obj.eaoMember || null;
    this.epicProjectID = obj && obj.epicProjectID || null;
    this.fedElecDist = obj && obj.fedElecDist || null;
    this.isTermsAgreed = obj && obj.isTermsAgreed || null;
    this.overallProgress = obj && obj.overallProgress || null;
    this.primaryContact = obj && obj.primaryContact || null;
    this.proMember = obj && obj.proMember || null;
    this.provElecDist = obj && obj.provElecDist || null;
    this.shortName = obj && obj.shortName || null;
    this.projectPhase = obj && obj.projectPhase || null;
    this.substitution = obj && obj.substitution || null;
    this.updatedBy = obj && obj.updatedBy || null;
    this.commentPeriodForBanner = obj && obj.commentPeriodForBanner || null;
    this.read = obj && obj.read || null;
    this.write = obj && obj.write || null;
    this.delete = obj && obj.delete || null;
    this.activitiesAndUpdatesEnabled = obj && obj.activitiesAndUpdatesEnabled || null;
    this.contactFormEnabled = obj && obj.contactFormEnabled || null;
    this.contactFormEmails = obj && obj.contactFormEmails || null;

    // copy centroid
    if (obj && obj.centroid) {
      obj.centroid.forEach(num => {
        this.centroid.push(num);
      });
    }
  }
}

export interface ProjectLogo {
  document: string;
  name: string;
  alt: string;
  link: string;
}

export interface ProjectLogoWithSource extends ProjectLogo {
  source: string;
}
