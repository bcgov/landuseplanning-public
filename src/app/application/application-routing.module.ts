import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationComponent } from './application.component';
import { ApplicationResolver } from './application-resolver.service';
import { ApplicationRoutes } from './application-routes';

const routes: Routes = [
  {
    path: 'a/:appId',
    component: ApplicationComponent,
    resolve: {
      application: ApplicationResolver
    },
    // each tab within the page navigates to a separate route
    // e.g. /application/:id/(application|comments|decisions)
    children: ApplicationRoutes
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
