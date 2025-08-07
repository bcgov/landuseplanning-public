import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './project-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    data: {
      title: 'List View of Projects',
      focush1: true
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectListRoutingModule { }