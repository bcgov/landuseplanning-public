import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { CoordinatesModule } from 'angular-coordinates';
import { MatSlideToggleModule, MatIconModule } from '@angular/material';

import { OrderByPipe } from '../pipes/order-by.pipe';
import { NewlinesPipe } from '../pipes/newlines.pipe';

@NgModule({
  imports: [
    // CommonModule
    // CoordinatesModule
    MatSlideToggleModule,
    MatIconModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe
  ],
  exports: [
    MatSlideToggleModule,
    MatIconModule,
    OrderByPipe,
    NewlinesPipe
  ]
})
export class SharedModule { }
