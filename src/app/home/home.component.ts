import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SearchService } from 'app/services/search.service';
import { Subject } from 'rxjs';
import { News } from 'app/models/news'

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
        console.log('activities', res)
        this.results = res;
        this._changeDetectionRef.detectChanges();
      });
  }

  makeAriaLabel(activity: News) {
    let activityPhrase, viewDocPhrase;
    activity.headline ? activityPhrase = activity.headline : activityPhrase = `this update`;
    activity.documentUrlText ? viewDocPhrase = activity.documentUrlText : viewDocPhrase = `View document`;
    return `${viewDocPhrase} attached to ${activityPhrase}`;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
