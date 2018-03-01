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
import { AppRoutingModule } from 'app/app-routing.module';

// components
import { AppComponent } from 'app/app.component';
import { HomeComponent } from 'app/home/home.component';
import { LifecycleComponent } from 'app/lifecycle/lifecycle.component';
// import { ProcessComponent } from 'app/process/process.component';
import { ContactComponent } from 'app/contact/contact.component';
import { SearchComponent } from 'app/search/search.component';
import { HeaderComponent } from 'app/header/header.component';

// services
import { ApplicationService } from 'app/services/application.service';
import { ProponentService } from 'app/services/proponent.service';
import { OrganizationService } from 'app/services/organization.service';
import { DocumentService } from 'app/services/document.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { DecisionService } from 'app/services/decision.service';

// feature modules
import { MapModule } from 'app/map/map.module';
import { ApplicationsModule } from 'app/applications/applications.module';
import { CommentPeriod } from 'app/models/commentperiod';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LifecycleComponent,
    // ProcessComponent,
    ContactComponent,
    SearchComponent,
    HeaderComponent
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
