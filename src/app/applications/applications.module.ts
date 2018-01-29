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
// import { OverviewTabContentComponent } from './application-detail/overview/overview-tab-content.component';
// import { AuthorizationsTabContentComponent } from './application-detail/authorizations/authorizations-tab-content.component';
// import { ComplianceTabContentComponent } from './application-detail/compliance/compliance-tab-content.component';
// import { SiteActivitiesComponent } from './site-activities/site-activities.component';
import { DocumentsTabContentComponent } from './application-detail/documents/documents-tab-content.component';

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
    // OverviewTabContentComponent,
    // AuthorizationsTabContentComponent,
    // ComplianceTabContentComponent,
    // SiteActivitiesComponent,
    DocumentsTabContentComponent
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
