import { Component, Input, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
// import { HttpEventType } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';

import { Document } from 'app/models/document';
import { CommentPeriod } from 'app/models/commentperiod';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';
import { SurveyService } from 'app/services/survey.service';
import { SurveyResponseService } from 'app/services/surveyResponse.service';
import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import * as moment from 'moment-timezone';
import { Project } from 'app/models/project';
import { Survey } from 'app/models/survey';
import { SurveyResponse } from 'app/models/surveyResponse';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-add-survey-response',
  templateUrl: './add-survey-response.component.html',
  styleUrls: ['./add-survey-response.component.scss'],
})
export class AddSurveyResponseComponent implements OnInit, OnDestroy {
  @Input() currentPeriod: CommentPeriod;
  @Input() project: Project;
  @Input() survey: Survey;

  public submitting = false;
  public close = false;
  private progressValue: number;
  public formProgress: number;
  public tempSurvey: Survey;
  public surveyResponse: SurveyResponse;
  public surveyResponseObj: any;
  public surveyResponseForm: FormGroup;
  public surveyResponseQuestionsForm: FormArray;
  private progressBufferValue: number;
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

  constructor(
    public activeModal: NgbActiveModal,
    private commentService: CommentService,
    private surveyService: SurveyService,
    private surveyResponseService: SurveyResponseService,
    private surveyBuilderService: SurveyBuilderService,
    private documentService: DocumentService,
    private config: ConfigService,
  ) {}

  ngOnInit() {
    // this.commentingMethod = this.currentPeriod.commentingMethod;
    this.documentAuthorType = null;

    this.formProgress = 0;

    // this.onFormValuesUpdate();

    console.log('what', this.survey)

    this.formInit();

  }

  public formInit() {
    this.surveyResponseForm = new FormGroup({
      author: new FormControl(),
      location: new FormControl(),
    });

    this.surveyResponseObj = this.surveyBuilderService.buildSurveyResponseObj(this.survey);

    // this.surveyResponseQuestionsForm = this.surveyBuilderService.buildForm(this.surveyResponseObj.responses)

    // this.surveyResponseForm.addControl('responses', this.surveyResponseQuestionsForm)

    // this.surveyResponseQuestionsForm = this.surveyResponseForm.get('responses') as FormArray;

    // this.surveyResponseQuestionsForm.insert(0, new FormGroup({
    //   'question': new FormControl(),
    //   'response': new FormControl()
    // }))

    // this.surveyBuilderService.buildForm(this.surveyResponseQuestionsForm, this.survey.questions)

    console.log('here is something', this.surveyResponseObj)

    // const surveySubmit =

    this.surveyResponseObj.responses.forEach(entry => {
      if (entry.answer) {
        entry.answer = entry.answer.value;
      }
    })

    console.log('and then there is this', this.surveyResponseObj)
  }

  // public onFormValuesUpdate() {
  //   this.surveyResponseForm.valueChanges
  //     .takeUntil(this.ngUnsubscribe)
  //     .subscribe(val => {
  //       let formValues = Object.values(val);
  //       let completedValues = formValues.filter(value => {
  //         if (value !== "" && value !== null) {
  //           return value;
  //         }
  //       })
  //       let completedAmount = formValues.length / completedValues.length
  //       this.formProgress = 100 / completedAmount;
  //       console.log(completedAmount)
  //     })
  // }

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

  public toggleClose() {
    this.close = true;
  }

  private p1_next() {
    this.currentPage++;
  }

  private p2_back() {
    this.currentPage--;
  }

  private p2_next() {
    this.submitting = true;
    // this.progressValue = this.progressBufferValue = 0;

    // approximate size of everything for progress reporting
    // const commentSize = this.sizeof(this.comment);
    // this.totalSize = commentSize;

    const files = [];
    /*this.documents.map((item) => {
      console.log('upfile', item.upfile);
      files.push(item.upfile);
    });*/

    // this.documents.forEach(item => {
    //   console.log('upfile', item.upfile);
    //   files.push(item.upfile);
    // });

    // files.forEach(file => this.totalSize += file.size);

    // first add new comment
    // this.progressBufferValue += 100 * commentSize / this.totalSize;

    // Build the comment
    // this.comment.author = this.contactName;
    // this.comment.comment = this.commentInput;
    // this.comment.location = this.locationInput;
    // this.comment.isAnonymous = !this.makePublic;



    this.surveyResponseService.add(this.surveyResponseObj)
      .toPromise()
      .then((surveyResponse: SurveyResponse) => {
        // this.progressValue += 100 * commentSize / this.totalSize;
        // this.surveyResponse = surveyResponse;
        console.log(surveyResponse)
        return surveyResponse;
      })
      // .then((surveyResponse: SurveyResponse) => {
        // then upload all documents
        // const observables: Array<Observable<Document>> = [];

        // files.forEach(file => {
        //   const formData = new FormData();
        //   formData.append('_comment', this.comment._id);
        //   formData.append('displayName', file.name);
        //   formData.append('documentSource', 'COMMENT');
        //   formData.append('documentAuthor', this.comment.author);
        //   formData.append('project', this.project._id);
        //   formData.append('documentFileName', file.name);
        //   formData.append('internalOriginalName', file.name);
        //   formData.append('documentSource', 'COMMENT');
        //   formData.append('dateUploaded', moment());
        //   formData.append('datePosted', moment());
        //   formData.append('upfile', file);
        //   this.progressBufferValue += 100 * file.size / this.totalSize;

        //   // TODO: improve progress bar by listening to progress events
        //   // see https://stackoverflow.com/questions/37158928/angular-2-http-progress-bar
        //   // see https://angular.io/guide/http#listening-to-progress-events
        //   observables.push(this.documentService.add(formData)
        //     .map((document: Document) => {
        //       this.progressValue += 100 * file.size / this.totalSize;
        //       return document;
        //     })
        //     // .subscribe((event: HttpEventType) => {
        //     //   if (event.type === HttpEventType.UploadProgress) {
        //     //     // TODO: do something here
        //     //   }
        //     // })
        //   );
        // });

        // execute all uploads in parallel
        // return Observable.forkJoin(observables).toPromise();
      // })
      .then(() => {
        this.submitting = false;
        this.currentPage++;
      })
      .catch(error => {
        console.log('error', error);
        alert('Uh-oh, error submitting survey response');
        this.submitting = false;
      });
  }

  makeAriaLabel(docName) {
    if (docName) {
      return `Remove ${docName} uploaded document.`;
    } else {
      return `Remove this uploaded document.`;
    }
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
