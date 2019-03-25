import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

// Modules
import { SharedModule } from 'app/shared.module';

// Components
import { ApplicationsComponent } from './applications.component';
import { AppListComponent } from './app-list/app-list.component';
import { AppMapComponent } from './app-map/app-map.component';
import { MarkerPopupComponent } from './app-map/marker-popup/marker-popup.component';
import { DetailsPanelComponent } from './details-panel/details-panel.component';
import { DetailsMapComponent } from './details-panel/details-map/details-map.component';
import { ExplorePanelComponent } from './explore-panel/explore-panel.component';
import { DateInputComponent } from './explore-panel/date-input/date-input.component';
import { FindPanelComponent } from './find-panel/find-panel.component';
import { SplashModalComponent } from './splash-modal/splash-modal.component';
import { PurposeInfoModalComponent } from './purpose-info-modal/purpose-info-modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, NgbModule.forRoot(), RouterModule, SharedModule],
  declarations: [
    ApplicationsComponent,
    AppListComponent,
    AppMapComponent,
    MarkerPopupComponent,
    DetailsPanelComponent,
    DetailsMapComponent,
    ExplorePanelComponent,
    DateInputComponent,
    FindPanelComponent,
    SplashModalComponent,
    PurposeInfoModalComponent
  ],
  entryComponents: [MarkerPopupComponent, SplashModalComponent, PurposeInfoModalComponent]
})
export class ApplicationsModule {}
