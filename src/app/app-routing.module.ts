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
      title: 'Contact Us'
    }
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    data: {
      title: 'List View of Projects'
    }
  },
  {
    path: 'projects-list',
    component: ProjectListComponent,
    data: {
      title: 'Map View of Projects'
    }
  },
  {
    path: 'news',
    component: NewsListComponent,
    resolve: {
      activities: NewsResolver
    },
    data: {
      title: 'Activities and Updates'
    }
  },
  {
    path: 'legislation',
    component: LegislationComponent,
    data: {
      title: 'Legislation'
    }
  },
  {
    path: 'engagement',
    component: EngagementComponent,
    data: {
      title: 'Engagement'
    }
  },
  {
    path: 'faq',
    component: FaqComponent,
    data: {
      title: 'Frequently Asked Questions'
    }
  },
  {
    path: 'compliance-oversight',
    component: ComplianceOversightComponent,
    data: {
      title: 'Compliance Oversight'
    }
  },
  {
    path: 'modernizing',
    component: ModernizingComponent,
    data: {
      title: 'Modernized Land Use Planning'
    }
  },
  {
    path: 'phases',
    component: ProcessComponent,
    data: {
      title: 'Project Phases'
    }
  },
  {
    path: 'search-help',
    component: SearchHelpComponent,
    data: {
      title: 'Search Help'
    }
  },
  {
    // default route
    path: '',
    component: HomeComponent,
    data: {
      title: 'Home'
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
