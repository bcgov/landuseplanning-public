import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from 'app/shared/shared.module';

// components
import { CommentsComponent } from './comments.component';
import { AddCommentComponent } from './add-comment/add-comment.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    AddCommentComponent,
    CommentsComponent
  ],
  entryComponents: [
    AddCommentComponent
  ]
})
export class CommentsModule { }
