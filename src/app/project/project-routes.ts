import { Routes } from '@angular/router';

import { ProjectTabComponent } from './project-tab/project-tab.component';
import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';

export const ProjectRoutes: Routes = [
  {
    path: '',
    redirectTo: 'project',
    pathMatch: 'full'
  },
  {
    path: 'project',
    component: ProjectTabComponent
  },
  {
    path: 'commenting',
    component: CommentingTabComponent
  },
  {
    path: 'decisions',
    component: DecisionsTabComponent
  }
];
