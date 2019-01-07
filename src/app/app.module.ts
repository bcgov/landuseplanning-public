import { NgModule } from '@angular/core';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { CookieService } from 'ngx-cookie-service';

// modules
import { SharedModule } from 'app/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { ApplicationsModule } from 'app/applications/applications.module';

// components
import { AppProxyComponent } from 'app/app-proxy.component';
import { AppComponent } from 'app/app.component';
import { CommentModalComponent } from 'app/comment-modal/comment-modal.component';
import { ContactComponent } from 'app/contact/contact.component';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { HeaderComponent } from 'app/header/header.component';
import { HomeComponent } from 'app/home/home.component';
import { AboutComponent } from 'app/about/about.component';
import { FooterComponent } from 'app/footer/footer.component';

// services
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { FeatureService } from 'app/services/feature.service';
import { UrlService } from 'app/services/url.service';

@NgModule({
  imports: [
    TagInputModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    Ng2PageScrollModule.forRoot(),
    SharedModule,
    ApplicationsModule,
    AppRoutingModule // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
  ],
  declarations: [
    AppProxyComponent,
    AppComponent,
    CommentModalComponent,
    ContactComponent,
    FileUploadComponent,
    HeaderComponent,
    HomeComponent,
    AboutComponent,
    FooterComponent
  ],
  providers: [
    CookieService,
    ApiService,
    ApplicationService,
    CommentService,
    CommentPeriodService,
    ConfigService,
    DecisionService,
    DocumentService,
    FeatureService,
    UrlService
  ],
  entryComponents: [
    CommentModalComponent
  ],
  bootstrap: [
    AppComponent
  ]
})

export class AppModule { }
