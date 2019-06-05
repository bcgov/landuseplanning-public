import { Component, OnInit, Input, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'app/services/api';

import { Document } from 'app/models/document';
import { DocumentsResolver } from 'app/project/documents/documents-resolver.service';

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
  public documents: any[];

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private elRef: ElementRef,
    private api: ApiService,
    ) {
      this.documents = [];
    }

  async ngOnInit() {
    this.itemIndexId = 'comment-index-' + this.itemIndex;

    // Populate the documents for this item.
    if (this.item.documents && this.item.documents.length > 0) {
      // populate the docs.
      for (let doc of this.item.documents) {
        let docs = await this.api.getDocument(doc)
        .map( async (res: any) => {
          let record = JSON.parse(<string>res._body);
          // console.log("record:", record[0]);
          return new Document(record[0]);
        }).toPromise();
        this.documents.push(docs);
      }
    }
  }

  public toggleShowMore() {
    this.showMore = !this.showMore;
  }

  public openAttachment(file) {
    let doc = new Document(
      {
        _id: file._id,
        internalOriginalName: file.internalOriginalName,
        documentSource: file.documentSource
      });
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
