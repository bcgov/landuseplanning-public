import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { MatSlideToggleModule, MatProgressBarModule } from '@angular/material';

import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ObjectFilterPipe } from 'app/pipes/object-filter.pipe';

import { FileUploadComponent } from 'app/file-upload/file-upload.component';

@NgModule({
  imports: [
    // CommonModule,
    BrowserModule,
    MatSlideToggleModule,
    MatProgressBarModule
  ],
  declarations: [
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    FileUploadComponent
  ],
  exports: [
    MatSlideToggleModule,
    MatProgressBarModule,
    OrderByPipe,
    NewlinesPipe,
    ObjectFilterPipe,
    FileUploadComponent
  ]
})

export class SharedModule { }
