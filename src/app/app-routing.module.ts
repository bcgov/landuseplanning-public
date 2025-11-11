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
      focush1: true,
      description: 'System health check for Planning in Partnership.',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      title: 'Contact Us',
      focush1: true,
      description: 'Get in touch with the Planning in Partnership team. Find contact information for land and water planning inquiries in British Columbia.'
    }
  },
  {
    path: 'projects',
    loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule),
    data: {
      title: 'Map View of Projects',
      focush1: true,
      description: 'Interactive map view of land and water planning projects across British Columbia. Explore active planning engagements in your area.'
    }
  },
  {
    path: 'projects-list',
    loadChildren: () => import('./projects/project-list/project-list.module').then(m => m.ProjectListModule),
    data: {
      title: 'List View of Projects',
      focush1: true,
      description: 'Browse all land and water planning projects in British Columbia. View active planning engagements in list format.'
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
      focush1: true,
      description: 'Latest news, activities, and updates on land and water planning projects in British Columbia.'
    }
  },
  {
    path: 'legislation',
    component: LegislationComponent,
    data: {
      title: 'Legislation',
      focush1: true,
      description: 'Learn about the legislation governing land and water planning in British Columbia, including relevant acts and regulations.'
    }
  },
  {
    path: 'wsp',
    component: EngagementComponent,
    data: {
      title: 'Water Planning',
      focush1: true,
      description: 'Information about water sustainability planning in British Columbia and how to get involved.'
    }
  },
  {
    path: 'faq',
    component: FaqComponent,
    data: {
      title: 'Frequently Asked Questions',
      focush1: true,
      description: 'Find answers to common questions about planning processes, engagement opportunities, and how to participate in B.C.'
    }
  },
  {
    path: 'compliance-oversight',
    component: ComplianceOversightComponent,
    data: {
      title: 'Compliance Oversight',
      focush1: true,
      description: 'Information about compliance and oversight for planning projects in British Columbia.'
    }
  },
  {
    path: 'lup',
    component: ModernizingComponent,
    data: {
      title: 'Land Use Planning',
      focush1: true,
      description: 'Learn about land use planning modernization initiatives in British Columbia and how they support sustainable development.'
    }
  },
  {
    path: 'flp',
    component: ProcessComponent,
    data: {
      title: 'Forest Landscape Planning',
      focush1: true,
      description: 'Information about forest landscape planning processes in British Columbia, including how to participate and provide input.'
    }
  },
  {
    path: 'unsubscribe',
    component: UnsubscribeComponent,
    data: {
      title: 'Unsubscribe from project updates',
      focush1: true,
      description: 'Unsubscribe from email updates for planning projects.',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'confirm-email/:emailAddress/:confirmKey',
    component: ConfirmEmailComponent,
    data: {
      title: 'Confirm Email Address',
      focush1: true,
      description: 'Confirm your email address to receive updates on planning projects.',
      robots: 'noindex, nofollow'
    }
  },
  {
    // default route
    path: '',
    component: HomeComponent,
    data: {
      title: 'Home',
      focush1: true,
      description: 'Find, learn about, and comment on active land and water planning engagements in British Columbia. Planning in Partnership.'
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
