import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';

import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ObjectFilterPipe } from 'app/pipes/object-filter.pipe';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { VarDirective } from 'app/utils/ng-var.directive';
import { DragMoveDirective } from 'app/utils/drag-move.directive';

@NgModule({
  imports: [
    // CommonModule,
    BrowserModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgxTextOverflowClampModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    VarDirective,
    DragMoveDirective
  ],
  exports: [
    MatProgressBarModule,
    MatSnackBarModule,
    NgxTextOverflowClampModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    VarDirective,
    DragMoveDirective
  ]
})

export class SharedModule { }
