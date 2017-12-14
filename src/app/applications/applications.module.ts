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
import { OrderByPipe } from '../filters/order-by.pipe';
import { NewlinePipe } from '../filters/newline.pipe';

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
    ApplicationDetailComponent
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
