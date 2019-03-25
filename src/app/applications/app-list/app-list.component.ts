import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

const LIST_PAGE_SIZE = 10;

@Component({
  selector: 'app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isLoading: boolean; // from applications component
  @Input() applications: Application[] = []; // from applications component
  @Input() isListVisible: Application[] = []; // from applications component
  @Output() setCurrentApp = new EventEmitter(); // to applications component
  @Output() unsetCurrentApp = new EventEmitter(); // to applications component

  private currentApp: Application = null; // for selecting app in list
  public isListLoading = true; // initial value
  private numToShow = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService // used in template
  ) {}

  public ngOnInit() {}

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    // update list only if it's visible
    if (this.isListVisible) {
      if (changes.isLoading && changes.isLoading.currentValue) {
        // start of loading is when applications component starts data querying
        // or when we get a new list of apps (see above)
        // NB: end of loading is set below
        this.isListLoading = true;
      }

      if (changes.applications && !changes.applications.firstChange && changes.applications.currentValue) {
        // console.log('list: got visible apps from map component');
        // console.log('# visible apps =', this.applications.length);

        // start of loading is when we get a new list of apps
        // or when applications component starts data querying (see below)
        this.isListLoading = true;
        this.numToShow = LIST_PAGE_SIZE; // init/reset
        this.setLoaded();
      }
    }
  }

  // when list becomes visible, reload all apps
  public onListVisible() {
    // start of loading is when list becomes visible
    // or when applications component starts data querying (see below)
    this.isListLoading = true;
    this.numToShow = LIST_PAGE_SIZE; // init/reset
    this.setLoaded();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private isCurrentApp(item: Application): boolean {
    return item === this.currentApp;
  }

  public toggleCurrentApp(item: Application) {
    const index = _.findIndex(this.applications, { _id: item._id });
    if (index >= 0) {
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
        this.setCurrentApp.emit(item);
      } else {
        // DO NOT UNSET DETAILS AT THIS TIME
        // this.currentApp = null; // unset
        // this.unsetCurrentApp.emit(item);
      }
    }
  }

  public loadedApps(): Application[] {
    return this.applications.filter(a => a.isLoaded);
  }

  public appsWithShapes(): Application[] {
    return this.applications.filter(a => a.centroid.length === 2);
  }

  public loadMore() {
    this.numToShow += LIST_PAGE_SIZE;
    this.setLoaded();
  }

  private setLoaded() {
    let isNoneLoaded = true;
    // fully load first 'n' apps
    for (let i = 0; i < this.applications.length && i < this.numToShow; i++) {
      if (!this.applications[i].isLoaded) {
        isNoneLoaded = false;
        this.applicationService
          .getById(this.applications[i]._id, true)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            app => {
              if (app) {
                // safety check
                this.applications[i] = app;
                this.applications[i].isLoaded = true;
              }
            },
            error => console.log(error)
          );
      }
    }
    if (isNoneLoaded) {
      // end of loading is when we have loaded some of our data
      this.isListLoading = false;
    }
  }
}
