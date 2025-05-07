import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from 'app/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Components
import { ProjectsComponent } from './projects.component';
import { ProjlistListComponent } from './projlist-list/projlist-list.component';
import { ProjlistMapComponent } from './projlist-map/projlist-map.component';
import { ProjlistFiltersComponent } from './projlist-filters/projlist-filters.component';
import { ProjectListFiltersComponent } from './project-list-filters/project-list-filters.component';
import { ProjDetailPopupComponent } from './proj-detail-popup/proj-detail-popup.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListTableRowsComponent } from './project-list/project-list-table-rows/project-list-table-rows.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    RouterModule,
    SharedModule,
		MatCheckboxModule,
  ],
  declarations: [
    ProjectsComponent,
    ProjlistListComponent,
    ProjlistMapComponent,
    ProjlistFiltersComponent,
    ProjectListFiltersComponent,
    ProjDetailPopupComponent,
    ProjectListComponent,
    ProjectListTableRowsComponent
  ]
})

export class ProjectsModule { }
