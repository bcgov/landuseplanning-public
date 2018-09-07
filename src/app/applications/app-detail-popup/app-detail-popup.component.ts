import { Component } from '@angular/core';
import { Application } from 'app/models/application';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './app-detail-popup.component.html',
  styleUrls: ['./app-detail-popup.component.scss']
})

export class AppDetailPopupComponent {
  public app: Application = null;
}