import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

import { OrderByPipe } from '../filters/order-by.pipe';
import { NewlinesPipe } from '../filters/newlines.pipe';

@NgModule({
  imports: [
    // CommonModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe
  ],
  exports: [
    OrderByPipe,
    NewlinesPipe
  ]
})
export class SharedModule { }
