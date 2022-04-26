import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { News } from 'app/models/news';

@Component({
    selector: 'tbody[app-news-list-table-rows]',
    templateUrl: './news-list-table-rows.component.html',
    styleUrls: ['./news-list-table-rows.component.scss']
})

export class NewsListTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;

    public activities: any;
    public paginationData: any;

    constructor(
      private router: Router,
      public domSanitizer: DomSanitizer,
    ) { }

    ngOnInit() {
        this.activities = this.data.data;
        this.paginationData = this.data.paginationData;
    }

    goToCP(activity) {
      this.router.navigate(['p', activity.project._id, 'cp', activity.pcp]);
    }

    public goToItem(itemURL) {
      window.open(itemURL);
    }

    isSingleDoc(item) {
      if (item !== ''
         && item !== null
         ) {
        return true;
      } else {
        return false;
      }
    }

    makeAriaLabel(activity: News) {
      let activityPhrase, viewDocPhrase;
      activity.headline ? activityPhrase = activity.headline : activityPhrase = `this update`;
      activity.documentUrlText ? viewDocPhrase = activity.documentUrlText : viewDocPhrase = `View document`;
      return `${viewDocPhrase} attached to ${activityPhrase}`;
    }
}
