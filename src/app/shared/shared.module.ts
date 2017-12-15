import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

import { OrderByPipe } from '../filters/order-by.pipe';
import { NewlinePipe } from '../filters/newline.pipe';

@NgModule({
  imports: [
    // CommonModule
  ],
  declarations: [
    OrderByPipe,
    NewlinePipe
  ],
  exports: [
    OrderByPipe,
    NewlinePipe
  ]
})
export class SharedModule { }
