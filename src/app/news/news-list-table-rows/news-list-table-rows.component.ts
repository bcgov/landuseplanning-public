import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

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
      private router: Router
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
}
