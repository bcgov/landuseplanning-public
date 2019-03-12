import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from 'app/shared/shared.module';

// Components
import { ProjectsComponent } from './projects.component';
import { ProjlistListComponent } from './projlist-list/projlist-list.component';
import { ProjlistMapComponent } from './projlist-map/projlist-map.component';
import { ProjlistFiltersComponent } from './projlist-filters/projlist-filters.component';
import { ProjDetailPopupComponent } from './proj-detail-popup/proj-detail-popup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule.forRoot(),
    RouterModule,
    SharedModule
  ],
  declarations: [
    ProjectsComponent,
    ProjlistListComponent,
    ProjlistMapComponent,
    ProjlistFiltersComponent,
    ProjDetailPopupComponent
  ],
  entryComponents: [
    ProjDetailPopupComponent
  ]
})

export class ProjectsModule { }
