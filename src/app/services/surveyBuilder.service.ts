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

  constructor() {}

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

  // Make author and location no longer required
  buildSurveyResponseForm(survey) {
    let form = new FormGroup({
      author: new FormControl(null),
      location: new FormControl(null),
      // author: new FormControl(null, Validators.required),
      // location: new FormControl(null, Validators.required),
      responses: new FormArray([])
    })
    let surveyResponses = form.get('responses') as FormArray;

    survey.questions.forEach(question => {
      surveyResponses.push(this.newFormQuestion(question))
    })

    return form;
  }

  newFormQuestion(question) {
    const validators = this.combineValidators(question)

    if (question.type === 'smallText' || question.type === 'largeText') {
      return new FormGroup({
        textAnswer: new FormControl(null, validators)
      })
    } else if (question.type === 'singleChoice') {
      return new FormGroup({
        singleChoice: new FormControl(null, validators),
        otherText: new FormControl()
      })
    } else if (question.type === 'multiChoice') {
      const choicesArray = new FormArray([]);
      question.choices.forEach(choice => {
        choicesArray.push(new FormControl())
      })
      return new FormGroup({
        multiChoices: choicesArray,
        other: new FormControl(),
        otherText: new FormControl()
      })
    } else if (question.type === 'docPicker') {
      return new FormGroup({
        docPicker: new FormControl()
      })
    } else if (question.type === 'info') {
      return new FormGroup({
        info: new FormControl()
      })
    } else if (question.type === 'likert') {
      const attributesArray = new FormArray([]);
      question.attributes.forEach(choice => {
        attributesArray.push(new FormGroup({
          choice: new FormControl()
        }))
      })
      return new FormGroup({
        attributeChoices: attributesArray,
      })
    } else if (question.type === 'email') {
      return new FormGroup({
        emailAnswer: new FormControl(null, validators)
      })
    } else if (question.type === 'phoneNumber') {
      return new FormGroup({
        phoneNumberAnswer: new FormControl(null, validators)
      })
    }
  }

  combineValidators(question) {
    const validators = [];

    if (question.maxChars) {
      validators.push(Validators.maxLength(question.maxChars))
    }
    if (question.answerRequired) {
      validators.push(Validators.required)
    }
    if (question.type === 'phoneNumber') {
      validators.push(Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$'))
    }
    if (question.type === 'email') {
      validators.push(Validators.email)
    }
    if (!question.answerRequired && !question.maxChars && question.type !== 'phoneNumber' && question.type !== 'email') {
      validators.push(Validators.nullValidator)
    }

    return Validators.compose(validators)
  }

}

