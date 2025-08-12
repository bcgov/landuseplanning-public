import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactComponent } from 'app/contact/contact.component';
import { HomeComponent } from 'app/home/home.component';
import { NewsListComponent } from './news/news.component';
import { LegislationComponent } from './legislation/legislation.component';
import { EngagementComponent } from './engagement/engagement.component';
import { FaqComponent } from './faq/faq.component';
import { ProcessComponent } from './process/process.component';
import { ComplianceOversightComponent } from './compliance-oversight/compliance-oversight.component';
import { ModernizingComponent } from './modernizing/modernizing.component';
import { UnsubscribeComponent } from './project/email-subscribe/unsubscribe/unsubscribe.component';
import { ConfirmEmailComponent } from './project/email-subscribe/confirm-email/confirm-email.component';
import { HealthCheckComponent } from './health-check/health-check.component';
import { NewsResolver } from './news/news-resolver.service';

const routes: Routes = [
	{
    path: 'healthz',
    component: HealthCheckComponent,
    data: {
      title: 'Health Check',
      focush1: true
    }
  },
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
    loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule),
    data: { 
      title: 'Map View of Projects', 
      focush1: true 
    }
  },
  {
    path: 'projects-list',
    loadChildren: () => import('./projects/project-list/project-list.module').then(m => m.ProjectListModule),
    data: {
      title: 'List View of Projects',
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
    path: 'wsp',
    component: EngagementComponent,
    data: {
      title: 'Water Planning',
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
    path: 'lup',
    component: ModernizingComponent,
    data: {
      title: 'Land Use Planning',
      focush1: true
    }
  },
  {
    path: 'flp',
    component: ProcessComponent,
    data: {
      title: 'Forest Landscape Planning',
      focush1: true
    }
  },
  {
    path: 'unsubscribe',
    component: UnsubscribeComponent,
    data: {
      title: 'Unsubscribe from project updates',
      focush1: true
    }
  },
  {
    path: 'confirm-email/:emailAddress/:confirmKey',
    component: ConfirmEmailComponent,
    data: {
      title: 'Confirm Email Address',
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
