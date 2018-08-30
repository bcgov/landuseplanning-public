import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges, ElementRef } from '@angular/core';
import * as L from 'leaflet';
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
  @Input() allApps: Array<Application> = []; // from map component
  @Output() setCurrentApp = new EventEmitter(); // to map component
  @Output() unsetCurrentApp = new EventEmitter(); // to map component
  @Output() updateResultsChange = new EventEmitter(); // to map component

  private currentApp: Application = null; // for selecting app in list
  public gotChanges = false;

  constructor(
    private commentPeriodService: CommentPeriodService, // used in template
    private configService: ConfigService, // used in template
    private elementRef: ElementRef
  ) { }

  get clientWidth(): number {
    return this.elementRef.nativeElement.childNodes[0].clientWidth; // div#applist-list.app-list__container
  }

  public ngOnInit() {
    // prevent underlying map actions for these events
    const element = <HTMLElement>document.getElementById('applist-list');
    L.DomEvent.disableClickPropagation(element); // includes double-click
    L.DomEvent.disableScrollPropagation(element);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.allApps && !changes.allApps.firstChange && changes.allApps.currentValue) {
      // console.log('got allApps change');
      this.gotChanges = true;
    }
  }

  public ngOnDestroy() { }

  private isCurrentApp(item: Application): boolean {
    return (item === this.currentApp);
  }

  public toggleCurrentApp(item: Application) {
    const index = _.findIndex(this.allApps, { _id: item._id });
    if (index >= 0) {
      // this.allApps.splice(index, 1, item); // NOT NEEDED
      if (!this.isCurrentApp(item)) {
        this.currentApp = item; // set
        this.setCurrentApp.emit(item);

      } else {
        this.currentApp = null; // unset
        this.unsetCurrentApp.emit(item);
      }
    }
  }

  public matchesVisibleCount(apps: Application[]): number {
    return apps.filter(a => a.isMatches && a.isVisible).length;
  }
}
