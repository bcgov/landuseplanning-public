import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProjectComponent } from './project.component';
import { ProjectResolver } from './project-resolver.service';
import { ProjectRoutes } from './project-routes';
import { CommentsRoutes } from 'app/comments/comments-routes';
import { CommentsComponent } from 'app/comments/comments.component';
import { CommentsResolver } from 'app/comments/comments-resolver.service';
import { CommentsModule } from 'app/comments/comments.module';

const routes: Routes = [
  {
    path: 'p/:projId/cp/:commentPeriodId',
    component: CommentsComponent,
    resolve: {
      commentPeriod: CommentsResolver
    },
    // each tab within the page navigates to a separate route
    // e.g. /project/:id/(project|comments|decisions)
    children: CommentsRoutes
  },
  {
    path: 'p/:projId',
    component: ProjectComponent,
    resolve: {
      project: ProjectResolver
    },
    // each tab within the page navigates to a separate route
    // e.g. /project/:id/(project|comments|decisions)
    children: ProjectRoutes
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule,
    CommentsModule
  ],
  providers: [
    ProjectResolver,
    CommentsResolver
  ]
})

export class ProjectRoutingModule { }
