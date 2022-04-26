import * as moment from 'moment';
import { Project } from './project';
import { Survey } from './survey';


export class CommentPeriod {
  _id: string;
  __v: Number;
  _schemaName: String;
  addedBy: String;
  additionalText: String;
  ceaaAdditionalText: String;
  ceaaInformationLabel: String;
  ceaaRelatedDocuments: String;
  classificationRoles: String;
  classifiedPercent: Number;
  commenterRoles: String;
  dateAdded: String;
  dateCompleted: Date;
  dateCompletedEst: String;
  dateStarted: Date;
  dateStartedEst: String;
  dateUpdated: String;
  downloadRoles: String;
  informationLabel: String;
  instructions: String;
  isClassified: Boolean;
  isPublished: Boolean;
  isResolved: Boolean;
  isVetted: String;
  commentingMethod: string;
  externalToolPopupText: string;
  surveySelected: Survey;
  milestone: String;
  openCommentPeriod: String;
  openHouses: String;
  periodType: String;
  phase: String;
  phaseName: String;
  project: Project;
  publishedPercent: Number;
  rangeOption: String;
  rangeType: String;
  relatedDocuments: Array<String> = [];
  resolvedPercent: Number;
  updatedBy: String;
  userCan: String;
  vettedPercent: Number;
  vettingRoles: String;
  commentPeriodInfo: string;

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  // Not from API
  commentPeriodStatus: string;
  daysRemaining: String;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.__v = obj && obj.__v || null;
    this._schemaName = obj && obj._schemaName || null;
    this.addedBy = obj && obj.addedBy || null;
    this.additionalText = obj && obj.additionalText || null;
    this.ceaaAdditionalText = obj && obj.ceaaAdditionalText || null;
    this.ceaaInformationLabel = obj && obj.ceaaInformationLabel || null;
    this.ceaaRelatedDocuments = obj && obj.ceaaRelatedDocuments || null;
    this.classificationRoles = obj && obj.classificationRoles || null;
    this.classifiedPercent = obj && obj.classifiedPercent || null;
    this.commenterRoles = obj && obj.commenterRoles || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.dateCompletedEst = obj && obj.dateCompletedEst || null;
    this.dateStartedEst = obj && obj.dateStartedEst || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.downloadRoles = obj && obj.downloadRoles || null;
    this.informationLabel = obj && obj.informationLabel || null;
    this.instructions = obj && obj.instructions || null;
    this.isClassified = obj && obj.isClassified || null;
    this.isPublished = obj && obj.isPublished || null;
    this.isResolved = obj && obj.isResolved || null;
    this.isVetted = obj && obj.isVetted || null;
    this.commentingMethod = obj && obj.commentingMethod || null;
    this.externalToolPopupText = obj && obj.externalToolPopupText || null;
    this.surveySelected = obj && obj.surveySelected || null;
    this.milestone = obj && obj.milestone || null;
    this.openHouses = obj && obj.openHouses || null;
    this.periodType = obj && obj.periodType || null;
    this.phase = obj && obj.phase || null;
    this.phaseName = obj && obj.phaseName || null;
    this.project = obj && obj.project || null;
    this.publishedPercent = obj && obj.publishedPercent || null;
    this.rangeOption = obj && obj.rangeOption || null;
    this.rangeType = obj && obj.rangeType || null;
    this.relatedDocuments = obj && obj.relatedDocuments || null;
    this.resolvedPercent = obj && obj.resolvedPercent || null;
    this.updatedBy = obj && obj.updatedBy || null;
    this.userCan = obj && obj.userCan || null;
    this.vettedPercent = obj && obj.vettedPercent || null;
    this.vettingRoles = obj && obj.vettingRoles || null;
    this.commentPeriodInfo = obj && obj.commentPeriodInfo || null;

    this.read = obj && obj.read || null;
    this.write = obj && obj.write || null;
    this.delete = obj && obj.delete || null;

    if (obj && obj.dateStarted) {
      this.dateStarted = new Date(obj.dateStarted);
    }

    if (obj && obj.dateCompleted) {
      this.dateCompleted = new Date(obj.dateCompleted);
    }

    // get comment period days remaining and determine commentPeriodStatus of the period
    if (obj && obj.dateStarted && obj.dateCompleted) {
      const now = new Date();
      const dateStarted = moment(obj.dateStarted);
      const dateCompleted = moment(obj.dateCompleted);
      const sevenDays = new Date(obj.dateStarted);
      sevenDays.setDate(sevenDays.getDate() - 7);

      if (moment(now).isBetween(dateStarted, dateCompleted)) {
        this.commentPeriodStatus = 'Open';
        let days = dateCompleted.diff(moment(now), 'days');
        this.daysRemaining = days + (days === 1 ? ' Day ' : ' Days ') + 'Remaining';
      } else if (moment(now).isAfter(dateCompleted)) {
        this.commentPeriodStatus = 'Closed';
        this.daysRemaining = 'Completed';
      } else if (moment(now).isBetween(moment(sevenDays), dateStarted)) {
        this.commentPeriodStatus = 'Pending';
        this.daysRemaining = 'Pending';
      }
    }
  }
}
