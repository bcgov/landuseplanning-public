import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from 'app/shared/shared.module';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';

// components
import { CommentsComponent } from './comments.component';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { AddSurveyResponseComponent } from './add-survey-response/add-survey-response.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxPaginationModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    FileUploadComponent,
    AddCommentComponent,
    CommentsComponent,
    AddSurveyResponseComponent
  ],
  exports: [
    FileUploadComponent
  ],
  entryComponents: [
    AddCommentComponent,
    AddSurveyResponseComponent
  ]
})
export class CommentsModule { }
