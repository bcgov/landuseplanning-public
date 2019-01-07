import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from 'app/home/home.component';
import { AboutComponent } from 'app/about/about.component';
import { ContactComponent } from 'app/contact/contact.component';
import { ApplicationsComponent } from 'app/applications/applications.component';
import { AppProxyComponent } from './app-proxy.component';

const routes: Routes = [
  {
    path: 'home/:showSplashModal',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
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
    redirectTo: 'home/true',
    pathMatch: 'full'
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/home/true'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
