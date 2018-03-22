import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MainMapComponent } from './main-map/main-map.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    MainMapComponent
  ],
  exports: [
    MainMapComponent
  ],
  providers: [
  ]
})
export class MapModule { }
