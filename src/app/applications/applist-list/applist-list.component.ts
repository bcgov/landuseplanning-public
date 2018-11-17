import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-applist-list',
  templateUrl: './applist-list.component.html',
  styleUrls: ['./applist-list.component.scss']
})

export class ApplistListComponent implements OnInit, OnChanges, OnDestroy {

  @Input() applications: Array<Application> = []; // from applications component
  @Output() setCurrentApp = new EventEmitter(); // to applications component
  @Output() unsetCurrentApp = new EventEmitter(); // to applications component

  private currentApp: Application = null; // for selecting app in list
  public loading = true; // init
  private numToShow = 0;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public applicationService: ApplicationService,
    public commentPeriodService: CommentPeriodService, // used in template
    public configService: ConfigService,
    private elementRef: ElementRef
  ) { }

  get clientWidth(): number {
    return this.elementRef.nativeElement.firstElementChild.clientWidth; // div.app-list__container
  }

  public ngOnInit() { }

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    // update list only if it's visible
    if (this.configService.isApplicationsListVisible) {
      if (changes.applications && !changes.applications.firstChange && changes.applications.currentValue) {
        // console.log('list: got visible apps from map component');
        // console.log('# visible apps =', this.applications.length);

        // start of loading is when we get a new list of apps
        // or when applications component starts data querying (see below)
        this.loading = true;
        this.numToShow = this.configService.listPageSize; // init/reset
        this.setLoaded();
      }
    }
  }

  // when list becomes visible, reload all apps
  public onListVisible() {
    // start of loading is when list becomes visible
    // or when applications component starts data querying (see below)
    this.loading = true;
    this.numToShow = this.configService.listPageSize; // init/reset
    this.setLoaded();
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private isCurrentApp(item: Application): boolean {
    return (item === this.currentApp);
  }

  public toggleCurrentApp(item: Application) {
    const index = _.findIndex(this.applications, { _id: item._id });
    if (index >= 0) {
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
        this.setCurrentApp.emit(item);
      } else {
        this.currentApp = null; // unset
        this.unsetCurrentApp.emit(item);
      }
    }
  }

  public loadedApps(): Array<Application> {
    return this.applications.filter(a => a.isLoaded);
  }

  public appsWithShapes(): Array<Application> {
    return this.applications.filter(a => a.centroid.length === 2);
  }

  public onLoadStart() {
    // start of loading is when applications component starts data querying
    // or when we get a new list of apps (see above)
    this.loading = true;
  }

  public onLoadEnd() {
    // end of loading is set below
  }

  public loadMore() {
    this.numToShow += this.configService.listPageSize;
    this.setLoaded();
  }

  private setLoaded() {
    let isNoneLoaded = true;
    // fully load first 'n' apps
    for (let i = 0; i < this.applications.length && i < this.numToShow; i++) {
      if (!this.applications[i].isLoaded) {
        isNoneLoaded = false;
        this.applicationService.getById(this.applications[i]._id, true)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            app => {
              this.applications[i] = app;
              this.applications[i].isLoaded = true;
              // end of loading is when we have loaded some of our data
              this.loading = false;
            },
            error => console.log(error)
          );
      }
    }
    if (isNoneLoaded) {
      this.loading = false;
    }
  }

}
