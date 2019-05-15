import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from 'app/shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';
import { CommentsModule } from 'app/project/comments/comments.module';


// components
import { ProjectComponent } from './project.component';
import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';
import { DateInputComponent } from 'app/date-input/date-input.component';
import { DocumentsTabComponent } from './documents/documents-tab.component';
import { DocumentTableRowsComponent } from 'app/project/documents/project-document-table-rows/project-document-table-rows.component';
import { DocumentDetailComponent } from 'app/project/documents/detail/detail.component';

import { StorageService } from 'app/services/storage.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    RouterModule,
    SharedModule,
    CommentsModule,
    ProjectRoutingModule
  ],
  declarations: [
    ProjectComponent,
    CommentingTabComponent,
    DecisionsTabComponent,
    DocumentDetailComponent,
    DateInputComponent,
    DocumentsTabComponent,
    DocumentTableRowsComponent
  ],
  providers: [
    StorageService
  ],
  entryComponents: [
    DocumentTableRowsComponent
  ]
})

export class ProjectModule { }
