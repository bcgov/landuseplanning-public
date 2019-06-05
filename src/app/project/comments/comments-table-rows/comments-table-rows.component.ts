import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit, Renderer2 } from '@angular/core';
import { ApiService } from 'app/services/api';

import { Document } from 'app/models/document';
import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
  selector: 'app-comments-table-rows',
  templateUrl: './comments-table-rows.component.html',
  styleUrls: ['./comments-table-rows.component.scss']
})
export class CommentsTableRowsComponent implements OnInit, AfterViewInit {
  @Input() data: TableObject;

  public comments: any;
  public paginationData: any;
  public loading = true;
  public showMore = false;

  constructor(
    private api: ApiService,
    private _changeDetectionRef: ChangeDetectorRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {

    this.comments = this.data.data;
    this.paginationData = this.data.paginationData;

    // Scrolling while the page renders seems to cause problems with the comment section.
    this.renderer.addClass(document.body, 'no-scroll');

    // Populate the documents for this item.
    this.comments.map(async comment => {
      if (comment.documents && comment.documents.length > 0) {
        // populate the docs.
        let documents = [];
        for (let doc of comment.documents) {
          let docs = await this.api.getDocument(doc)
            .map(async (res: any) => {
              let record = JSON.parse(<string>res._body);
              // console.log("record:", record[0]);
              return record[0];
            }).toPromise();
          documents.push(docs);
        }
        comment.documents = documents;
        this._changeDetectionRef.detectChanges();
      }
      this.loading = false;
    });
  }

  ngAfterViewInit() {
    this.checkOverflow();
    this.renderer.removeClass(document.body, 'no-scroll');
    this._changeDetectionRef.detectChanges();
  }

  public toggleShowMore(index) {
    let commentElement = document.getElementById(index);
    commentElement.className === 'show-less' ? commentElement.className = '' : commentElement.className = 'show-less';
  }

  public checkOverflow() {
    Array.from(document.getElementsByClassName('comment')).forEach(element => {
      if (element.clientHeight < element.scrollHeight) {
        element.className = 'show-less';
      } else {
        document.getElementById('read-button-' + element.id).remove();
      }
    });
  }

  public openAttachment(file) {
    let doc = new Document({ _id: file });
    this.api.openDocument(doc);
  }
}
