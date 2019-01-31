import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';

// modules
import { SharedModule } from 'app/shared.module';

// components
import { CommentsComponent } from './comments.component';
import { ViewCommentComponent } from './view-comment/view-comment.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    RouterModule,
    SharedModule,
  ],
  declarations: [
    CommentsComponent,
    ViewCommentComponent
  ],
  entryComponents: [
    ViewCommentComponent,
  ]
})
export class CommentsModule { }
