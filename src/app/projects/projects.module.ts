import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Modules
import { SharedModule } from 'app/shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Components
import { ProjectsComponent } from './projects.component';
import { ProjlistListComponent } from './projlist-list/projlist-list.component';
import { ProjlistMapComponent } from './projlist-map/projlist-map.component';
import { ProjlistFiltersComponent } from './projlist-filters/projlist-filters.component';
import { ProjDetailPopupComponent } from './proj-detail-popup/proj-detail-popup.component';
import { ProjectsRoutingModule } from './projects-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedModule,
    MatCheckboxModule,
    ProjectsRoutingModule
  ],
  declarations: [
    ProjectsComponent,
    ProjlistListComponent,
    ProjlistMapComponent,
    ProjlistFiltersComponent,
    ProjDetailPopupComponent,
  ]
})
export class ProjectsModule { }
