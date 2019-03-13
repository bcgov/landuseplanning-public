import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from 'app/about/about.component';
import { ContactComponent } from 'app/contact/contact.component';
import { ApplicationsComponent } from 'app/applications/applications.component';
import { HomeProxyComponent } from './home-proxy.component';
import { ApplicationsProxyComponent } from './applications-proxy.component';

const routes: Routes = [
  {
    // proxy component is needed because fragment in redirectTo doesn't work in Angular v4
    path: 'home/:showSplashModal',
    component: HomeProxyComponent
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
    // proxy component is needed because query parameter and fragment in redirectTo don't work in Angular v4
    path: 'a/:id/:tab',
    component: ApplicationsProxyComponent
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
export class AppRoutingModule {}
