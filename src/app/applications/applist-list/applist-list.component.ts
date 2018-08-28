import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
  @Input() currentApp: Application = null; // from map component
  @Output() setCurrentApp = new EventEmitter(); // to map component
  @Output() unsetCurrentApp = new EventEmitter(); // to map component
  @Output() updateResultsChange = new EventEmitter(); // to map component

  public gotChanges = false;
  public doUpdateResults = true; // bound to checkbox - initial state

  constructor(
    private commentPeriodService: CommentPeriodService, // used in template
    private configService: ConfigService
  ) { }

  public ngOnInit() {
    // prevent underlying map actions for these events
    const element = <HTMLElement>document.getElementById('applist-list');
    L.DomEvent.disableClickPropagation(element); // includes double-click
    L.DomEvent.disableScrollPropagation(element);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.currentApp && !changes.currentApp.firstChange && changes.currentApp.currentValue) {
      console.log('got currentApp change');
      // nothing to do
    } else if (changes.allApps && !changes.allApps.firstChange && changes.allApps.currentValue) {
      this.gotChanges = true;

      // sync initial state to map
      this.updateResultsChange.emit(this.doUpdateResults);
    }
  }

  public ngOnDestroy() { }

  private isCurrentApp(item: Application): boolean {
    return (item === this.currentApp);
  }

  private toggleCurrentApp(item: Application) {
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
