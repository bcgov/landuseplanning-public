import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-table',
  templateUrl: './item-table.component.html',
  styleUrls: ['./item-table.component.scss']
})
export class ItemTableComponent implements OnInit {

  @Input() items: any[];
  @Input() listType: String;
  @Input() pageSize: Number;
  @Input() currentPage: Number;
  @Input() totalComments: Number;

  @Output() onPageNumUpdate: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  updatePageNumber(pageNum) {
    this.onPageNumUpdate.emit(pageNum);
  }

}
