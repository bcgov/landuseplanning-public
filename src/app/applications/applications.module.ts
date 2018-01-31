import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

// modules
import { MapModule } from 'app/map/map.module';
import { ApplicationsRoutingModule } from './applications-routing.module';
import { SharedModule } from 'app/shared/shared.module';

// components
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationTabContentComponent } from './application-detail/application/application-tab-content.component';
import { CommentsTabContentComponent } from './application-detail/comments/comments-tab-content.component';
import { DecisionTabContentComponent } from './application-detail/decision/decision-tab-content.component';

// services
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';

@NgModule({
  imports: [
    CommonModule,
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
    DecisionTabContentComponent
  ],
  exports: [
    ApplicationListComponent,
    ApplicationDetailComponent
  ],
  providers: [
    ApiService,
    ApplicationService
  ]
})

export class ApplicationsModule { }
