import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

import { SurveyQuestion } from '../models/surveyQuestion';
import { Survey } from '../models/survey';
import { of } from 'rxjs';
import { SurveyResponse } from 'app/models/surveyResponse';
import { SurveyQuestionAnswer } from 'app/models/surveyQuestionAnswer';
// import { Utils } from 'app/shared/utils/utils';


@Injectable()
export class SurveyBuilderService {

  // private utils = new Utils();
  public surveyResponseForm: FormGroup;

  constructor() {

    // this.questions = [

    //   new SingleChoiceQuestion({
    //     key: 'brave',
    //     label: 'Bravery Rating',
    //     options: [
    //       {key: 'solid',  value: 'Solid'},
    //       {key: 'great',  value: 'Great'},
    //       {key: 'good',   value: 'Good'},
    //       {key: 'unproven', value: 'Unproven'}
    //     ],
    //     order: 3
    //   }),

    //   new TextboxQuestion({
    //     key: 'firstName',
    //     label: 'First name',
    //     value: 'Bombasto',
    //     required: true,
    //     order: 1
    //   }),

    //   new TextboxQuestion({
    //     key: 'emailAddress',
    //     label: 'Email',
    //     type: 'email',
    //     order: 2
    //   })
    // ];

  }

  // toFormGroup(questions: SurveyQuestion<string>[] ) {
  //   let group: any = {};

  //   questions.forEach(question => {
  //     group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
  //                                             : new FormControl(question.value || '');
  //   });
  //   console.log('this is the group', group);
  //   return new FormGroup(group);
  // }

  genSurveyResponseForm(survey: Survey) {
    survey.questions.forEach(question => {

    })
  }

  buildForm(questions) {
    let newForm = new FormArray([]);

    questions.forEach(surveyEntry => {
      newForm.push(this.newFormQuestion(surveyEntry.question))
    })

    return newForm;
  }

  buildSurveyResponseObj(survey) {
    let obj = {
      _id: null,
      author: null,
      location: null,
      dateAdded: null,
      commentPeriod: survey.commentPeriod,
      project: survey.project,
      survey: survey._id,
      responses: [],
      read: survey.read,
      write: survey.write,
      delete: survey.delete,
    }
    obj = this.nameLocationFields(obj);
    survey.questions.forEach(question => {
      obj.responses.push({question: question, answer: this.newFormQuestion(question)})
    })
    return obj;
  }

  newResponseObj(question: SurveyQuestion) {
    if (question.type === 'smallText' || question.type === 'largeText') {
      return { textResponse: null }
    } else if (question.type === 'singleChoice' || question.type === 'multiChoice') {
      if (question.other) {
        return { choices: null, otherText: null }
      } else {
        return { choices: null }
      }
    } else if (question.type === 'likert') {
      return { }
    } else if (question.type === 'docPicker') {
      return { docPickerText: question.docPickerText }
    } else if (question.type === 'info') {
      return { infoText: question.infoText}
    } else if (question.type === 'email') {
      return { emailResponse: null }
    } else if (question.type === 'phoneNumber') {
      return { phoneNumberResponse: null }
    }
  }

  nameLocationFields(surveyResponseObj) {
    surveyResponseObj.responses.push({question: {type: 'author', answerRequired: true}, answer: { authorResponse: null }})
    surveyResponseObj.responses.push({question: {type: 'location', answerRequired: true }, answer: { locationResponse: null }})
    return surveyResponseObj;
  }

  newFormQuestion(question) {
    const validators = this.combineValidators(question)

    if (question.type === 'smallText' || question.type === 'largeText') {
      return new FormGroup({
        textResponse: new FormControl('', validators)
      })
    } else if (question.type === 'singleChoice' && question.type === 'multiChoice') {
        return new FormGroup({
          other: new FormControl(),
          choices: new FormArray([], validators)
        })
    } else if (question.type === 'docPicker') {
      return new FormGroup({
      })
    } else if (question.type === 'likert') {

      return new FormGroup({
        attributes: new FormGroup({
          choices: new FormControl('', validators)
        }),
      })
    } else if (question.type === 'email') {
      return new FormGroup({
        emailResponse: new FormControl('', validators)
      })
    } else if (question.type === 'phoneNumber') {
      return new FormGroup({
        phoneNumberResponse: new FormControl('', validators)
      })
    } else if (question.type === 'author') {
      return new FormGroup({
        authorResponse: new FormControl('', validators)
      })
    } else if (question.type === 'location') {
      return new FormGroup({
        locationResponse: new FormControl('', validators)
      })
    }
  }

  combineValidators(question) {
    const validators = [];

    if (question.maxChars) {
      validators.push(Validators.max(question.maxChars))
    }
    if (question.answerRequired) {
      validators.push(Validators.required)
    }
    if (!question.answerRequired && !question.maxChars){
      validators.push(Validators.nullValidator)
    }

    return Validators.compose(validators)
  }

  // getQuestions() {
  //   return of(this.questions);
  // }
}

@Injectable()
export class QuestionService {

  // TODO: get from a remote source of question metadata

}
