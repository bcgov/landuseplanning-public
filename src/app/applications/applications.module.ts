import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

// modules
import { MapModule } from '../map/map.module';
import { ApplicationsRoutingModule } from './applications-routing.module';
import { SharedModule } from '../shared/shared.module';

// components
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
// import { OverviewTabContentComponent } from './application-detail/overview/overview-tab-content.component';
// import { AuthorizationsTabContentComponent } from './application-detail/authorizations/authorizations-tab-content.component';
// import { ComplianceTabContentComponent } from './application-detail/compliance/compliance-tab-content.component';
// import { SiteActivitiesComponent } from './site-activities/site-activities.component';
import { DocumentsTabContentComponent } from './application-detail/documents/documents-tab-content.component';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';

// services
import { Api } from '../services/api';
import { ApplicationService } from '../services/application.service';

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
    Api,
    ApplicationService
  ]
})
export class ApplicationsModule { }
