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
    this.searchService.getTopNewsItems()
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.results = res;
        this._changeDetectionRef.detectChanges();
      });
  }

  makeAriaLabel(activityName) {
    let activityPhrase;
    activityName ? activityPhrase = activityName : activityPhrase = `this update`;
    return `View document attached to ${activityPhrase}`;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
