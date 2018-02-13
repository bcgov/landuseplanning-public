import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

// modules
import { ApplicationsRoutingModule } from './applications-routing.module';
import { MapModule } from 'app/map/map.module';
import { SharedModule } from 'app/shared/shared.module';

// components
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationTabContentComponent } from './application-detail/application/application-tab-content.component';
import { CommentsTabContentComponent } from './application-detail/comments/comments-tab-content.component';
import { DecisionsTabContentComponent } from './application-detail/decisions/decisions-tab-content.component';
import { ViewCommentComponent } from './application-detail/comments/view-comment/view-comment.component';
import { AddCommentComponent } from './application-detail/add-comment/add-comment.component';

// services
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    ApplicationsRoutingModule,
    MapModule,
    SharedModule
  ],
  declarations: [
    ApplicationListComponent,
    ApplicationDetailComponent,
    ApplicationTabContentComponent,
    CommentsTabContentComponent,
    DecisionsTabContentComponent,
    ViewCommentComponent,
    AddCommentComponent
  ],
  exports: [
    ApplicationListComponent,
    ApplicationDetailComponent,
    ViewCommentComponent,
    AddCommentComponent
  ],
  providers: [
    ApiService,
    ApplicationService
  ],
  entryComponents: [
    ViewCommentComponent,
    AddCommentComponent
  ]
})

export class ApplicationsModule { }
