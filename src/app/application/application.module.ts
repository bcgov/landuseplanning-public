import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from 'app/shared.module';
import { ApplicationRoutingModule } from './application-routing.module';

// components
import { ApplicationComponent } from './application.component';
import { ApplicationTabComponent } from './application-tab/application-tab.component';
import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { ViewCommentComponent } from './commenting-tab/view-comment/view-comment.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    RouterModule,
    SharedModule,
    ApplicationRoutingModule
  ],
  declarations: [
    ApplicationComponent,
    ApplicationTabComponent,
    CommentingTabComponent,
    ViewCommentComponent,
    DecisionsTabComponent,
    AddCommentComponent,
    FileUploadComponent
  ],
  entryComponents: [
    ViewCommentComponent,
    AddCommentComponent
  ]
})

export class ApplicationModule { }
