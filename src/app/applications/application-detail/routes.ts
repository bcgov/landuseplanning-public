import { Routes } from '@angular/router';

import { ApplicationTabContentComponent } from './application/application-tab-content.component';
import { CommentsTabContentComponent } from './comments/comments-tab-content.component';
import { DecisionTabContentComponent } from './decision/decision-tab-content.component';

export const TAB_NAV_ROUTES: Routes = [
    { path: '', redirectTo: 'application', pathMatch: 'full' },
    { path: 'application', component: ApplicationTabContentComponent },
    { path: 'comments', component: CommentsTabContentComponent },
    { path: 'decision', component: DecisionTabContentComponent }
];
