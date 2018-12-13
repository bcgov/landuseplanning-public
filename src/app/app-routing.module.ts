import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppProxyComponent } from './app-proxy.component';
import { ContactComponent } from 'app/contact/contact.component';
import { ApplicationsComponent } from 'app/applications/applications.component';
import { HomeComponent } from 'app/home/home.component';

const routes: Routes = [
  {
    path: 'about',
    component: HomeComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'applications',
    component: ApplicationsComponent
  },
  {
    // redirect from legacy route to new route
    // eg, /a/5b15c2f743cf9c0019391cfc/application => /applications?id=5b15c2f743cf9c0019391cfc#details
    // proxy component is needed because query parameter in redirectTo doesn't work in Angular v4
    path: 'a/:id/:tab',
    component: AppProxyComponent
  },
  {
    // default route
    path: '',
    redirectTo: 'applications',
    pathMatch: 'full'
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/applications'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
