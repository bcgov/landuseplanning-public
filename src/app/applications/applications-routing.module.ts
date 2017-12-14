import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationDetailComponent } from './application-detail/application-detail.component';
import { ApplicationDetailResolver } from './application-detail-resolver.service';
import { TAB_NAV_ROUTES } from './application-detail/routes';

const routes: Routes = [
  {
    path: 'applications',
    component: ApplicationListComponent
  },
  {
    path: 'a/:code',
    component: ApplicationDetailComponent,
    resolve: {
      project: ApplicationDetailResolver
    },
    children: TAB_NAV_ROUTES  // each tab within the page navigates to a separate route; e.g. /p/:code/(overview|compliance|docs)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ApplicationDetailResolver]
})
export class ApplicationsRoutingModule { }
