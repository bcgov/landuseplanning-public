import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'app-expandable-items',
  templateUrl: './expandable-items.component.html',
  styleUrls: ['./expandable-items.component.scss']
})
export class ExpandableItemsComponent implements OnInit {
  @Input() listType: String;
  @Input() item: any[];
  @Input() itemIndex: number;


  public showMore: Boolean = false;
  public hideShowMoreButton: Boolean;
  public itemIndexId: string;

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.itemIndexId = 'comment-index-' + this.itemIndex;
  }

  public toggleShowMore() {
    this.showMore = !this.showMore;
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
