import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './project-list.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    data: {
      title: 'List View of Projects',
      focush1: true,
      description: 'Browse all land and water planning projects in British Columbia. View active planning engagements in list format.'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectListRoutingModule { }
