import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SearchService } from 'app/services/search.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  results: any;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.searchService.getSearchResults('',
    'RecentActivity',
    null,
    1,
    4,
    '-dateAdded',
    null,
    true,
    null // Secondary sort
    )
    .takeUntil(this.ngUnsubscribe)
    .subscribe((res: any) => {
      if (res[0].data.meta && res[0].data.meta.length > 0) {
        this.results = res[0].data.searchResults;
      }
      this._changeDetectionRef.detectChanges();
    });
  }

  ngOnDestroy() { }

}
