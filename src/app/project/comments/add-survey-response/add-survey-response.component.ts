import { Component, Input, Renderer2, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Utils } from 'app/shared/utils/utils';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';

import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { DocumentService } from 'app/services/document.service';
import { SurveyResponseService } from 'app/services/surveyResponse.service';
import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import * as moment from 'moment-timezone';
import { Project } from 'app/models/project';
import { Survey } from 'app/models/survey';
import { SurveyQuestion } from 'app/models/surveyQuestion';
import { SurveyResponse } from 'app/models/surveyResponse';
import { ConfigService } from 'app/services/config.service';
import { mergeAnalyzedFiles } from '@angular/compiler';

@Component({
  selector: 'app-add-survey-response',
  templateUrl: './add-survey-response.component.html',
  styleUrls: ['./add-survey-response.component.scss'],
})
export class AddSurveyResponseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() currentPeriod: CommentPeriod;
  @Input() project: Project;
  @Input() survey: Survey;

  public submitting = false;
  public close = false;
  public progressValue: number;
  public progressBufferValue: number;
  public formProgress: number;
  public countArray = [];
  public surveyQuestions: any;
  public surveyResponse: SurveyResponse;
  public surveyResponseObj: any;
  public surveyResponseForm: any;
  public surveyResponseQuestionsForm: FormArray;
  public checkedCounter = 0;
  public chooseArray = [];
  public totalSize: number;
  public currentPage = 1;
  public files: Array<File> = [];
  public documents: Document[] = [];
  public documentAuthor: any;
  public documentAuthorType: any;
  private comment: Comment;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();


  public contactName: any;
  public commentInput: any;
  public locationInput: any;
  public makePublic: any;
  public commentFiles: any;
  public commentingMethod: string;
  public scrollListener: () => void;

  constructor(
    public activeModal: NgbActiveModal,
    private utils: Utils,
    private renderer: Renderer2,
    private surveyResponseService: SurveyResponseService,
    private surveyBuilderService: SurveyBuilderService,
    private documentService: DocumentService,
    private config: ConfigService,
  ) {}

  ngOnInit() {
    this.documentAuthorType = null;
    this.surveyResponse = new SurveyResponse({responses: []})
    this.formProgress = 0;

    // this.onFormValuesUpdate();
    this.commentFiles = [];

    this.formInit();
  }

  ngAfterViewInit() {
    this.scrollListener = this.renderer.listen(document.querySelector('#survey-window'), 'scroll', (event) => {
      let scrollAmount = event.srcElement.scrollHeight - event.srcElement.clientHeight;
      let formProgressDecimal = event.srcElement.scrollTop / scrollAmount;
      this.formProgress = formProgressDecimal * 100;
    })
  }

  public formInit() {
    this.surveyItemCount(this.survey.questions)
    this.surveyResponseForm = this.surveyBuilderService.buildSurveyResponseForm(this.survey)

    this.chooseArray = this.survey.questions.map(question => (question.choose ? 0 : null))

  }

  get author() { return this.surveyResponseForm.get('author'); }
  get location() { return this.surveyResponseForm.get('location'); }

  surveyItemCount(questions) {
    let infoCount = 0;
    for (let i = 0; i < questions.length; i++) {
      // Count is noramlly incremented by three to account for author
      // and location fields and to display array indexes on view
      // Author and Location temporarily removed and so count
      // is incremeneted by 1
      let count = i + 1;
      if (questions[i].type === 'info') {
        this.countArray.push('')
        infoCount++;
      } else {
        this.countArray.push(count - infoCount)
      }
    }
  }

  register() {
  }

  public addFiles(files: FileList) {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list
          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            continue;
          }
          this.commentFiles.push(files[i]);
          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;
          document.internalOriginalName = files[i].name;
          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
  }

  public deleteFile(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.commentFiles = this.commentFiles.filter(item => (item.name !== doc.documentFileName));
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

  public closeDialog() {
    if (this.currentPage !== 3) {
      this.close = true;
    } else {
      this.activeModal.dismiss()
    }
  }

  public checkedState(event, index: number, question) {
    console.log('here is the question ', question)
    if (event.target.checked) {
      this.chooseArray[index]++
    }
    if (!event.target.checked) {
      this.chooseArray[index]--
    }
    if (question.choose) {
      if (this.chooseArray[index] === question.choose) {
        this.surveyResponseForm.controls.responses.controls[index].setErrors(null);
        console.log('errors nullified')
      } else {
        this.surveyResponseForm.controls.responses.controls[index].setErrors({'incorrect': true});
        console.log('errors set')
      }
    }
    if (question.answerRequired) {
      if (this.chooseArray[index] >= 1) {
        this.surveyResponseForm.controls.responses.controls[index].setErrors(null);
      } else {
        this.surveyResponseForm.controls.responses.controls[index].setErrors({'incorrect': true});
      }
    }
  }

  public chooseAmount(question) {
    if (question.choose && question.choose > 0) {
      return this.utils.numToWord(question.choose)
    } else {
      return 'at least one';
    }
  }

  private p1_next() {
    this.currentPage++;
  }

  private p2_back() {
    this.currentPage--;
  }

  private p2_next() {
    this.submitting = true;
    this.progressValue = this.progressBufferValue = 0;

    this.surveyResponse.dateAdded = new Date();
    this.surveyResponse.survey = this.survey._id;
    this.surveyResponse.period = this.currentPeriod._id;
    this.surveyResponse.project = this.project._id;

    this.surveyResponse.author = this.surveyResponseForm.get('author').value;
    this.surveyResponse.location = this.surveyResponseForm.get('location').value;
    this.surveyResponse.responses = [];


    // Loop through survey response form and save to response object
    for (let i = 0; i < this.survey.questions.length; i++) {
      let response;
      if (this.surveyResponseForm.get('responses').at(i).value.attributeChoices) {
        // save likert attribute choices
        response = {};
        response.attributeChoices = this.surveyResponseForm.get('responses').at(i).value.attributeChoices.map(attribute => attribute.choice)
      } else if (this.surveyResponseForm.get('responses').at(i).value.multiChoices || this.surveyResponseForm.get('responses').at(i).value.singleChoice) {
          response = {};
          // save multiple choices
          if (this.surveyResponseForm.get('responses').at(i).value.multiChoices) {
            response.multiChoices = [];
            this.surveyResponseForm.get('responses').at(i).value.multiChoices.forEach((choice, ci) => {
              if (choice === true) {
                response.multiChoices.push(this.survey.questions[i].choices[ci])
              }
            })
          }
          // Check if other options is selected before saving other text
          if (this.surveyResponseForm.get('responses').at(i).value.other || this.surveyResponseForm.get('responses').at(i).value.singleChoice === 'other') {
            response.otherText = this.surveyResponseForm.get('responses').at(i).value.otherText;
          } else {
            // Save single choice value if other is not selected
            response.singleChoice = this.surveyResponseForm.get('responses').at(i).value.singleChoice;
          }
      } else {
        // else save field value without any additional processing
        response = this.surveyResponseForm.get('responses').at(i).value;
      }

      this.surveyResponse.responses.push({
        question: this.survey.questions[i],
        answer: response
      })

    }

    // approximate size of everything for progress reporting
    const surveyResponseSize = this.sizeof(this.surveyResponse);
    this.totalSize = surveyResponseSize;

    const files = [];

    this.documents.forEach(item => {
      console.log('upfile', item.upfile);
      files.push(item.upfile);
    });

    files.forEach(file => this.totalSize += file.size);

    // first add new comment
    this.progressBufferValue += 100 * surveyResponseSize / this.totalSize;

    console.log('attempting to save sr', this.surveyResponse)

    this.surveyResponseService.add(this.surveyResponse)
      .toPromise()
      .then((surveyResponse: SurveyResponse) => {
        this.progressValue += 100 * surveyResponseSize / this.totalSize;
        this.surveyResponse = surveyResponse;
        return surveyResponse;
      })
      .then((surveyResponse: SurveyResponse) => {
        // then upload all documents
        const observables: Array<Observable<Document>> = [];

        files.forEach(file => {
          const formData = new FormData();
          formData.append('_comment', this.surveyResponse._id);
          formData.append('displayName', file.name);
          formData.append('documentSource', 'COMMENT');
          formData.append('documentAuthor', this.surveyResponse.author);
          formData.append('project', this.project._id);
          formData.append('documentFileName', file.name);
          formData.append('internalOriginalName', file.name);
          formData.append('documentSource', 'COMMENT');
          formData.append('dateUploaded', String(moment()));
          formData.append('datePosted', String(moment()));
          formData.append('upfile', file);
          this.progressBufferValue += 100 * file.size / this.totalSize;

          observables.push(this.documentService.add(formData)
            .map((document: Document) => {
              this.progressValue += 100 * file.size / this.totalSize;
              return document;
            })
          );
        });

        // execute all uploads in parallel
        return Observable.forkJoin(observables).toPromise();
      })
      .then(() => {
        this.submitting = false;
        this.currentPage++;
      })
      .catch(error => {
        console.log('error', error);
        alert('Uh-oh, error submitting comment');
        this.surveyResponse = new SurveyResponse({responses: {}})
        this.submitting = false;
      });
  }

  makeAriaLabel(docName) {
    let docPhrase;
    docName ? docPhrase = docName : docPhrase = 'this';
    return `Remove ${docPhrase} uploaded document.`;
  }

  // approximate size (keys + data)
  private sizeof(o: object) {
    let bytes = 0;

    Object.keys(o).forEach(key => {
      bytes += key.length;
      const obj = o[key];
      switch (typeof obj) {
        case 'boolean': bytes += 4; break;
        case 'number': bytes += 8; break;
        case 'string': bytes += 2 * obj.length; break;
        case 'object': if (obj) { bytes += this.sizeof(obj); } break;
      }
    });
    return bytes;
  }

  ngOnDestroy() {
    // Remove scroll listener
    if (this.scrollListener) {
      this.scrollListener();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
