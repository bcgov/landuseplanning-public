import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactComponent } from 'app/contact/contact.component';
import { ProjectsComponent } from 'app/projects/projects.component';
import { HomeComponent } from 'app/home/home.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { NewsListComponent } from './news/news.component';
import { LegislationComponent } from './legislation/legislation.component';
import { EngagementComponent } from './engagement/engagement.component';
import { FaqComponent } from './faq/faq.component';
import { ProcessComponent } from './process/process.component';
import { ComplianceOversightComponent } from './compliance-oversight/compliance-oversight.component';
import { ModernizingComponent } from './modernizing/modernizing.component';
import { SearchHelpComponent } from './search-help/search-help.component';
import { NewsResolver } from './news/news-resolver.service';

const routes: Routes = [
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      title: 'Contact Us',
      focush1: true
    }
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    data: {
      title: 'List View of Projects',
      focush1: true
    }
  },
  {
    path: 'projects-list',
    component: ProjectListComponent,
    data: {
      title: 'Map View of Projects',
      focush1: true
    }
  },
  {
    path: 'news',
    component: NewsListComponent,
    resolve: {
      activities: NewsResolver
    },
    data: {
      title: 'Activities and Updates',
      focush1: true
    }
  },
  {
    path: 'legislation',
    component: LegislationComponent,
    data: {
      title: 'Legislation',
      focush1: true
    }
  },
  {
    path: 'engagement',
    component: EngagementComponent,
    data: {
      title: 'Engagement',
      focush1: true
    }
  },
  {
    path: 'faq',
    component: FaqComponent,
    data: {
      title: 'Frequently Asked Questions',
      focush1: true
    }
  },
  {
    path: 'compliance-oversight',
    component: ComplianceOversightComponent,
    data: {
      title: 'Compliance Oversight',
      focush1: true
    }
  },
  {
    path: 'modernizing',
    component: ModernizingComponent,
    data: {
      title: 'Modernized Land Use Planning',
      focush1: true
    }
  },
  {
    path: 'phases',
    component: ProcessComponent,
    data: {
      title: 'Project Phases',
      focush1: true
    }
  },
  {
    path: 'search-help',
    component: SearchHelpComponent,
    data: {
      title: 'Search Help',
      focush1: true
    }
  },
  {
    // default route
    path: '',
    component: HomeComponent,
    data: {
      title: 'Home',
      focush1: true
    }
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [NewsResolver]
})

export class AppRoutingModule { }
