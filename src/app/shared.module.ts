import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material';

import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ObjectFilterPipe } from 'app/pipes/object-filter.pipe';

import { VarDirective } from 'app/utils/ng-var.directive';

@NgModule({
  imports: [
    // CommonModule,
    BrowserModule,
    MatProgressBarModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    VarDirective
  ],
  exports: [
    MatProgressBarModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    VarDirective
  ]
})

export class SharedModule { }
