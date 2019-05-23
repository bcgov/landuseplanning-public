import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactComponent } from 'app/contact/contact.component';
import { ProjectsComponent } from 'app/projects/projects.component';
import { HomeComponent } from 'app/home/home.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';

const routes: Routes = [
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'projects',
    component: ProjectsComponent
  },
  {
    path: 'projects-list',
    component: ProjectListComponent
  },
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
