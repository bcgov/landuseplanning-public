import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressBarModule } from '@angular/material';
import { MatSnackBarModule } from '@angular/material';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';

import { OrderByPipe } from 'app/shared/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/shared/pipes/newlines.pipe';
import { ObjectFilterPipe } from 'app/shared/pipes/object-filter.pipe';

import { VarDirective } from 'app/shared/utils/ng-var.directive';
import { DragMoveDirective } from 'app/shared/utils/drag-move.directive';

import { ItemTableComponent } from 'app/shared/components/item-table/item-table.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ExpandableItemsComponent } from './components/item-table/expandable-items/expandable-items.component';

@NgModule({
  imports: [
    BrowserModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgxTextOverflowClampModule,
    NgxPaginationModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    VarDirective,
    DragMoveDirective,
    ItemTableComponent,
    ExpandableItemsComponent,
  ],
  exports: [
    BrowserModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgxTextOverflowClampModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    VarDirective,
    DragMoveDirective,
    ItemTableComponent
  ]
})

export class SharedModule { }
