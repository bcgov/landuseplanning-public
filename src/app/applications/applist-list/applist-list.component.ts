import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-applist-list',
  templateUrl: './applist-list.component.html',
  styleUrls: ['./applist-list.component.scss']
})

export class ApplistListComponent implements OnInit, OnChanges, OnDestroy {
  // NB: this component is bound to the same list of apps as the other components
  @Input() applications: Array<Application> = []; // from applications component
  @Output() setCurrentApp = new EventEmitter(); // to applications component
  @Output() unsetCurrentApp = new EventEmitter(); // to applications component

  private currentApp: Application = null; // for selecting app in list
  public loading = false;
  private numToLoad = 0;

  constructor(
    public commentPeriodService: CommentPeriodService, // used in template
    public configService: ConfigService,
    private elementRef: ElementRef
  ) { }

  get clientWidth(): number {
    return this.elementRef.nativeElement.firstElementChild.clientHeight; // div.app-list__container
  }

  public ngOnInit() { }

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.applications && !changes.applications.firstChange && changes.applications.currentValue) {
      // console.log('list: got visible apps from map component');
      // console.log('# visible apps =', this.applications.length);

      this.numToLoad = this.configService.listPageSize; // init/reset
      this.setLoaded();
    }
  }

  public ngOnDestroy() { }

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

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() { this.loading = false; }

  public loadMore() {
    this.numToLoad += this.configService.listPageSize;
    this.setLoaded();
  }

  private setLoaded() {
    // set first 'n' apps as 'loaded'
    for (let i = 0; i < this.applications.length; i++) {
      this.applications[i].isLoaded = (i < this.numToLoad);
    }
  }
}
