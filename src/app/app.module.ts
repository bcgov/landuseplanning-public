import { NgModule } from '@angular/core';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { CookieService } from 'ngx-cookie-service';

// modules
import { SharedModule } from 'app/shared.module';
import { ApplicationModule } from 'app/application/application.module';
import { ProjectsModule } from 'app/projects/projects.module';
import { AppRoutingModule } from 'app/app-routing.module';

// components
import { AppComponent } from 'app/app.component';
import { HomeComponent } from 'app/home/home.component';
import { ContactComponent } from 'app/contact/contact.component';
import { HeaderComponent } from 'app/header/header.component';
import { FooterComponent } from 'app/footer/footer.component';

// services
import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';
import { FeatureService } from 'app/services/feature.service';
import { ProjectService } from 'app/services/project.service';
import { ConfigService } from 'app/services/config.service';

@NgModule({
  imports: [
    TagInputModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    NgxPaginationModule,
    Ng2PageScrollModule.forRoot(),
    BootstrapModalModule,
    SharedModule,
    ApplicationModule,
    ProjectsModule,
    AppRoutingModule // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent
  ],
  providers: [
    CookieService,
    ApiService,
    ProjectService,
    CommentService,
    CommentPeriodService,
    ConfigService,
    DecisionService,
    DocumentService,
    SearchService,
    FeatureService
  ],
  bootstrap: [
    AppComponent
  ]
})

export class AppModule { }
