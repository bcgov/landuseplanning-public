import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { ApiService } from 'app/services/api';

import { Document } from 'app/models/document';

@Component({
  selector: 'app-expandable-items',
  templateUrl: './expandable-items.component.html',
  styleUrls: ['./expandable-items.component.scss']
})
export class ExpandableItemsComponent implements OnInit {
  @Input() listType: String;
  @Input() item: any;
  @Input() itemIndex: number;


  public showMore: Boolean = false;
  public hideShowMoreButton: Boolean;
  public itemIndexId: string;

  constructor(
    private elRef: ElementRef,
    private api: ApiService,
    ) { }

  ngOnInit() {
    this.itemIndexId = 'comment-index-' + this.itemIndex;

    // Populate the documents for this item.
    if (this.item.documents && this.item.documents.length > 0) {
      // populate the docs.
      this.item.documents.map(doc => {
        // console.log("doc:", doc);
        this.api.getDocument(doc)
        .subscribe( (res: any) => {
          let record = JSON.parse(<string>res._body);
          // console.log("record:", record[0]);
          doc = record[0];
          return doc;
        });
      });
    }
  }

  public toggleShowMore() {
    this.showMore = !this.showMore;
  }

  public openAttachment(file) {
    let doc = new Document({_id: file});
    this.api.openDocument(doc);
  }

  // checkOverflow(element) {
  //   console.log(element);
  //   if (element.offsetHeight < element.scrollHeight ||
  //     element.offsetWidth < element.scrollWidth) {
  //     this.hideShowMoreButton = true;
  //   } else {
  //     this.hideShowMoreButton = false;
  //   }
  // }

}
