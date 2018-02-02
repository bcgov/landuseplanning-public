import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AuthorizationsComponent } from 'app/authorizations/authorizations.component';
// import { ComplianceOversightComponent } from 'app/compliance-oversight/compliance-oversight.component';
import { ContactComponent } from 'app/contact/contact.component';
import { HomeComponent } from 'app/home/home.component';
// import { LegislationComponent } from 'app/legislation/legislation.component';
import { LifecycleComponent } from 'app/lifecycle/lifecycle.component';
// import { ProcessComponent } from 'app/process/process.component';
import { MainMapComponent } from 'app/map/main-map/main-map.component';
import { SearchComponent } from 'app/search/search.component';

const routes: Routes = [
  // {
  //   path: 'authorizations',
  //   component: AuthorizationsComponent
  // },
  // {
  //   path: 'compliance-oversight',
  //   component: ComplianceOversightComponent
  // },
  {
    path: 'contact',
    component: ContactComponent
  },
  // {
  //   path: 'legislation',
  //   component: LegislationComponent
  // },
  {
    path: 'lifecycle',
    component: LifecycleComponent
  },
  // {
  //   path: 'process',
  //   component: ProcessComponent
  // },
  {
    path: 'map',
    component: MainMapComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
