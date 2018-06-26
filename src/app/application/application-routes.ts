import { Routes } from '@angular/router';

import { ApplicationTabComponent } from './application-tab/application-tab.component';
import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';

export const ApplicationRoutes: Routes = [
    {
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
];
