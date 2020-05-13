// import { Project } from './project';
// import { CommentPeriod } from './commentperiod';
// import { Survey } from './survey';
import { SurveyQuestion } from './surveyQuestion';
import { SurveyQuestionAnswer } from './surveyQuestionAnswer';

export class SurveyResponse {
  _id: string;
  dateAdded: Date;
  author: string;
  location: string;
  period: string;
  commentId: number;
  project: string;
  survey: string;
  documents: any;
  documentsList: any;
  responses: { question: SurveyQuestion, answer: SurveyQuestionAnswer }[];

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.author = obj && obj.author || null;
    this.commentId = obj && obj.commentId || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.delete = obj && obj.delete || null;
    this.location = obj && obj.location || null;
    this.documents = obj && obj.documents || null;
    this.documentsList = obj && obj.documentsList || [];
    this.period = obj && obj.period || null;
    this.dateAdded = obj && obj.dateAdded || null;
    this.period = obj && obj.period || null;
    this.project = obj && obj.project || null;
    this.survey = obj && obj.survey || null;
    this.responses = obj && obj.responses || null;

    this.read = obj && obj.read || null;
    this.write = obj && obj.write || null;
    this.delete = obj && obj.delete || null;
  }
}
