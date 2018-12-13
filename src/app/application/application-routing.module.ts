import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationComponent } from './application.component';
import { ApplicationResolver } from './application-resolver.service';
import { ApplicationTabComponent } from './application-tab/application-tab.component';
import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';

const routes: Routes = [
  {
    path: 'a/:appId',
    component: ApplicationComponent,
    resolve: {
      application: ApplicationResolver
    },
    // each tab within the page navigates to a separate route
    // e.g. /a/:id/(application|comments|decisions)
    children: [
      {
        // default route
        path: '',
        redirectTo: 'application',
        pathMatch: 'full'
      },
      {
        path: 'application',
        component: ApplicationTabComponent
      },
      {
        path: 'commenting',
        component: CommentingTabComponent
      },
      {
        path: 'decisions',
        component: DecisionsTabComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ApplicationResolver
  ]
})

export class ApplicationRoutingModule { }
