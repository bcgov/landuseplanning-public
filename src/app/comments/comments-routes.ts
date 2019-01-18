import { Routes } from '@angular/router';
import { CommentsComponent } from './comments.component';

export const CommentsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'comment',
    pathMatch: 'full'
  },
  {
    path: 'comment',
    component: CommentsComponent
  }
];
