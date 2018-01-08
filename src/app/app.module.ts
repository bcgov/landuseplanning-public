import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { CookieService } from 'ngx-cookie-service';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ObjectFilterPipe } from './object-filter.pipe';
// import { LegislationComponent } from './legislation/legislation.component';
import { ProcessComponent } from './process/process.component';
// import { ComplianceOversightComponent } from './compliance-oversight/compliance-oversight.component';
import { ContactComponent } from './contact/contact.component';
// import { AuthorizationsComponent } from './authorizations/authorizations.component';
import { SearchComponent } from './search/search.component';

// services
import { ProponentService } from './services/proponent.service';
import { ApplicationService } from './services/application.service';

// feature modules
import { MapModule } from './map/map.module';
import { ApplicationsModule } from './applications/applications.module';

import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ObjectFilterPipe,
    // LegislationComponent,
    ProcessComponent,
    // ComplianceOversightComponent,
    ContactComponent,
    // AuthorizationsComponent,
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
    MapModule
  ],
  providers: [ProponentService, ApplicationService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
