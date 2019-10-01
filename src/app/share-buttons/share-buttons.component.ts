import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';


@Component({
  selector: 'app-share-buttons',
  templateUrl: './share-buttons.component.html',
  styleUrls: ['./share-buttons.component.scss']
})
export class ShareButtonsComponent implements OnInit {
  public pageURL: String = '';
  public pageTitle: String = 'Provincial Land Use Planning';

  constructor(@Inject(DOCUMENT) doc: Document) {
    console.log(doc.location.href);
    this.pageURL = doc.location.href;
  }

  ngOnInit() {
  }

}
