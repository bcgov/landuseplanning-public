import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { CookieService } from 'ngx-cookie-service';
import { TagInputModule } from 'ngx-chips';

import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ObjectFilterPipe } from './object-filter.pipe';
import { LifecycleComponent } from './lifecycle/lifecycle.component';
// import { ProcessComponent } from './process/process.component';
import { ContactComponent } from './contact/contact.component';
import { SearchComponent } from './search/search.component';

// services
import { ApplicationService } from './services/application.service';
import { ProponentService } from './services/proponent.service';
import { OrganizationService } from './services/organization.service';
import { DocumentService } from './services/document.service';
import { CommentPeriodService } from './services/commentperiod.service';
import { CommentService } from './services/comment.service';
import { DecisionService } from './services/decision.service';

// feature modules
import { MapModule } from './map/map.module';
import { ApplicationsModule } from './applications/applications.module';
import { CommentPeriod } from 'app/models/commentperiod';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ObjectFilterPipe,
    LifecycleComponent,
    // ProcessComponent,
    ContactComponent,
    SearchComponent
  ],
  imports: [
    TagInputModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    ApplicationsModule,  // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    AppRoutingModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    Ng2PageScrollModule.forRoot(),
    BootstrapModalModule,
    MapModule,
    SharedModule
  ],
  providers: [
    CookieService,
    ApplicationService,
    ProponentService,
    OrganizationService,
    DocumentService,
    CommentPeriodService,
    CommentService,
    DecisionService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
