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

    isSingleDoc(item) {
      if (item !== ''
         && item !== null
         && item.indexOf('https://projects.eao.gov.bc.ca/p/') === -1
         && item.indexOf('docs?folder') === -1
         && item.indexOf('commentperiod') === -1
         ) {
        return true;
      } else {
        return false;
      }
    }
}
