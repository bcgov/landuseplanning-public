import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CommentsComponent } from './comments.component';
import { CommentsResolver } from './comments-resolver.service';
import { CommentsRoutes } from './comments-routes';

const routes: Routes = [
  {
    path: 'p/*/cp/:commentPeriodId',
    component: CommentsComponent,
    resolve: {
      project: CommentsResolver
    },
    // each tab within the page navigates to a separate route
    // e.g. /project/:id/(project|comments|decisions)
    children: CommentsRoutes
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
    CommentsResolver
  ]
})

export class CommentsRoutingModule { }
