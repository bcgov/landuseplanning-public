import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProjectDetailsTabComponent } from './project-details-tab.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';
import { ProjectActivitiesResolver } from '../project-activities/project-activities-resolver.service';
import { ShapeFileResolver } from './project-shapefile-resolver.service';
import { ProjectModule } from '../project.module';

const routes: Routes = [
  {
    path: '',
    component: ProjectDetailsTabComponent,
    resolve: {
      activities: ProjectActivitiesResolver,
      documents: ShapeFileResolver,
    },
    data: {
      title: 'Project Details',
      focush1: false,
      description: 'Detailed information about this project, including location, timeline, and engagement opportunities.'
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
    ProjectModule
  ],
  declarations: [
    ProjectDetailsTabComponent,
  ]
})
export class ProjectDetailsModule {}
