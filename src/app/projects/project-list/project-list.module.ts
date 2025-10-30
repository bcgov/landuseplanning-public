import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Used for search filters, `ngModel`, etc.
import { RouterModule } from '@angular/router'; // For routerLink, ActivatedRoute, etc.

import { MatSnackBarModule } from '@angular/material/snack-bar'; // Used for the snack bar

import { SharedModule } from 'app/shared/shared.module'; // Declares TableObject, table-template, etc.
import { ProjectListComponent } from './project-list.component';
import { ProjectListTableRowsComponent } from './project-list-table-rows/project-list-table-rows.component';
import { ProjectListFiltersComponent } from '../project-list-filters/project-list-filters.component';

import { ProjectListRoutingModule } from './project-list-routing.module'; // Routing file for this module
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    ProjectListComponent,
    ProjectListTableRowsComponent,
    ProjectListFiltersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    MatSnackBarModule,
    ProjectListRoutingModule,
    MatCheckboxModule
  ]
})
export class ProjectListModule { }
