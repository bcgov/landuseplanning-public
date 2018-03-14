import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactComponent } from 'app/contact/contact.component';
// import { MainMapComponent } from 'app/map/main-map/main-map.component';
// import { SearchComponent } from 'app/search/search.component';
import { HomeComponent } from 'app/home/home.component';

const routes: Routes = [
  {
    path: 'contact',
    component: ContactComponent
  },
  // {
  //   path: 'map',
  //   component: MainMapComponent
  // },
  // {
  //   path: 'search',
  //   component: SearchComponent
  // },
  {
    // default route
    path: '',
    component: HomeComponent
  },
  {
    // wildcard route
    path: '**',
    redirectTo: '/',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
