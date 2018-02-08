import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { Application } from 'app/models/application';
import { ApiService } from 'app/services/api';
import { Document } from 'app/models/document';
import { DocumentService } from 'app/services/document.service';

@Component({
  templateUrl: './application-tab-content.component.html',
  styleUrls: ['./application-tab-content.component.scss']
})
export class ApplicationTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public application: Application;
  public documents: Array<Document>;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.application = null;
    this.documents = null;

    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.application = data.application;

          // get application documents
          this.documents = [];
          this.documentService.getAllByApplicationId(this.application._id)
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
            documents => this.documents = documents,
            error => console.log(error)
            );
        }
      },
      error => console.log(error),
      () => this.loading = false
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
