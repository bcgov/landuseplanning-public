import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { CookieService } from 'ngx-cookie-service';

// modules
import { SharedModule } from 'app/shared/shared.module';
import { ProjectModule } from 'app/project/project.module';
import { ProjectsModule } from 'app/projects/projects.module';
import { AppRoutingModule } from 'app/app-routing.module';

// components
import { AppComponent } from 'app/app.component';
import { HomeComponent } from 'app/home/home.component';
import { ContactComponent } from 'app/contact/contact.component';
import { HeaderComponent } from 'app/header/header.component';
import { FooterComponent } from 'app/footer/footer.component';
import { NewsListTableRowsComponent } from 'app/news/news-list-table-rows/news-list-table-rows.component';
import { SplashModalComponent } from './splash-modal/splash-modal.component';
import { SearchHelpComponent } from './search-help/search-help.component';
import { ShareButtonsComponent } from './share-buttons/share-buttons.component';
import { EnvBannerComponent } from './header/env-banner/env-banner.component';
import { EngagementComponent } from './engagement/engagement.component';
import { ModernizingComponent } from './modernizing/modernizing.component';
import { FaqComponent } from './faq/faq.component';


// services
import { ApiService } from 'app/services/api';
import { SurveyService } from 'app/services/survey.service';
import { SurveyResponseService } from 'app/services/surveyResponse.service';
import { SurveyBuilderService } from 'app/services/surveyBuilder.service';
import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { SearchService } from 'app/services/search.service';
import { OrgService } from 'app/services/org.service';
import { FeatureService } from 'app/services/feature.service';
import { ProjectService } from 'app/services/project.service';
import { ConfigService } from 'app/services/config.service';
import { NewsListComponent } from 'app/news/news.component';
import { NewsMultifieldFilterPipe } from 'app/shared/pipes/news-multifield-filter.pipe';
import { LegislationComponent } from 'app/legislation/legislation.component';
import { ProcessComponent } from 'app/process/process.component';
import { ComplianceOversightComponent } from 'app/compliance-oversight/compliance-oversight.component';
import { ActivitiesListTableRowsComponent } from './project/project-activites/activities-list-table-rows/activities-list-table-rows.component';
import { EmailSubscribeService } from 'app/services/emailSubscribe.service';
import { DocumentSectionService } from './services/documentSection.service';

/**
 * Needed for NgxPageScrollCoreModule to set the default easing logic.
 *
 * Examples may be found at https://github.com/gdsmith/jquery.easing/blob/master/jquery.easing.js
 * or http://gizma.com/easing/
 *
 * @param {number} t current time
 * @param {number} b beginning value
 * @param {number} c change In value
 * @param {number} d duration
 * @return {number}
 */
const defaultPageScrollEasingLogic = (t: number, b: number, c: number, d: number): number => {
    // easeInOutExpo easing
    if (t === 0) {
      return b;
    }
    if (t === d) {
      return b + c;
    }
    if ((t /= d / 2) < 1) {
      return c / 2 * Math.pow(2, 8 * (t - 1)) + b;
    }
    return c / 2 * (-Math.pow(2, -8 * --t) + 2) + b;
};

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgxPageScrollModule,
    NgxPageScrollCoreModule.forRoot({
      scrollOffset: 50,
      easingLogic: defaultPageScrollEasingLogic
    }),
    SharedModule,
    ProjectModule,
    ProjectsModule,
    A11yModule,
    AppRoutingModule // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent,
    NewsListComponent,
    NewsMultifieldFilterPipe,
    NewsListTableRowsComponent,
    ActivitiesListTableRowsComponent,
    SplashModalComponent,
    LegislationComponent,
    ProcessComponent,
    ComplianceOversightComponent,
    SearchHelpComponent,
    EngagementComponent,
    ModernizingComponent,
    FaqComponent,
    ShareButtonsComponent,
    EnvBannerComponent
  ],
  providers: [
    ConfigService,
    CookieService,
    ApiService,
    ProjectService,
    SurveyService,
    SurveyResponseService,
    SurveyBuilderService,
    CommentService,
    CommentPeriodService,
    DecisionService,
    DocumentService,
    DocumentSectionService,
    SearchService,
    OrgService,
    FeatureService,
    EmailSubscribeService
  ],
  bootstrap: [
    AppComponent
  ]
})

export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', {get: () => applicationRef['components']});
  }
}
