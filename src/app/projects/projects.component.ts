import { Component, OnInit, OnDestroy, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/finally';
import * as L from 'leaflet';
import * as _ from 'lodash';

import { Project } from 'app/models/project';
import { Document } from 'app/models/document';
import { ProjectService } from 'app/services/project.service';
import { ConfigService } from 'app/services/config.service';
import { DocumentService } from 'app/services/document.service';

const PAGE_SIZE = 100;

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})

export class ProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('appmap') appmap;
  @ViewChild('applist') applist;
  @ViewChild('appfilters') appfilters;

  // FUTURE: change this to an observable and components subscribe to changes ?
  // ref: https://github.com/escardin/angular2-community-faq/blob/master/services.md#how-do-i-communicate-between-components-using-a-shared-service
  // ref: https://stackoverflow.com/questions/34700438/global-events-in-angular
  private _loading = false;
  set isLoading(val: boolean) {
    this._loading = val;
    if (val) {
      this.appfilters.onLoadStart();
      this.appmap.onLoadStart();
      this.applist.onLoadStart();
    } else {
      this.appfilters.onLoadEnd();
      this.appmap.onLoadEnd();
      this.applist.onLoadEnd();
    }
  }

  private snackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  public allApps: Array<any> = [];
  public projectShapefiles: Document[] = [];
  public filterApps: Array<Project> = [];
  public mapApps: Array<Project> = [];
  public listApps: Array<Project> = [];
  // private filters: FiltersType = null; // FUTURE
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  previousUrl: string;

  constructor(
    public snackBar: MatSnackBar,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private projectService: ProjectService,
    private documentService: DocumentService,
    public configService: ConfigService, // used in template
    private renderer: Renderer2
  ) {

    // add a class to the body tag here to limit the height of the viewport when on the Projects page
    this.router.events
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const currentUrlSlug = event.url.slice(1);
          this.renderer.removeClass(document.body, 'no-scroll');
          this._changeDetectionRef.detectChanges();
        }
      });
  }

  ngOnInit() {
    // prevent underlying map actions for list and filters components
    const applist_list = <HTMLElement>document.getElementById('applist-list');
    L.DomEvent.disableClickPropagation(applist_list);
    L.DomEvent.disableScrollPropagation(applist_list);

    const applist_filters = <HTMLElement>document.getElementById('applist-filters');
    L.DomEvent.disableClickPropagation(applist_filters);
    L.DomEvent.disableScrollPropagation(applist_filters);

    // load initial apps
    this.getApps();
  }

  private getApps() {
    // do this in another event so it's not in current change detection cycle
    setTimeout(() => {
      this.isLoading = true;
      this.snackBarRef = this.snackBar.open('Loading projects ...');
      this.allApps = []; // empty the list

      this.projectService.getCount()
        .takeUntil(this.ngUnsubscribe)
        .subscribe(count => {
          // prepare 'pages' of gets
          const observables: Array<Observable<Project[]>> = [];
          for (let page = 0; page < Math.ceil(count / PAGE_SIZE); page++) {
            observables.push(this.projectService.getAllFull(page, PAGE_SIZE));
          }

          // get all observables sequentially
          Observable.of([] as Project[]).concat(...observables)
            .takeUntil(this.ngUnsubscribe)
            .finally(() => {
              this.snackBarRef.dismiss();
              this.isLoading = false;
            })
            .subscribe((projects: Project[]) => {
              // Get all shapefiles.
              this.documentService.getAll("SHAPEFILE")
              .takeUntil(this.ngUnsubscribe)
              .subscribe(shapefiles => {
                  // "Attach" a shapefile to its project.
                  if (shapefiles) {
                    projects.forEach(project => {
                      // project.shapefiles = [];
                      shapefiles.forEach(shapefile => {
                        if (project._id === shapefile.project) {
                          project.shapefiles.push({
                            shapefileId: shapefile._id,
                            documentFileName: shapefile.documentFileName
                          })
                        }
                      })
                    })
                  }

                  this.allApps = _.concat(this.allApps, projects);
                  // filter component gets all apps
                  this.filterApps = this.allApps;
                });
            }, error => {
              console.error(error);
              alert('Uh-oh, couldn\'t load projects');
              // projects not found --> navigate back to home
              this.router.navigate(['/']);
            });
        }, error => {
          console.error(error);
          alert('Uh-oh, couldn\'t count projects');
          // projects not found --> navigate back to home
          this.router.navigate(['/']);
          this.snackBarRef.dismiss();
          this.isLoading = false;
        });
    }, 0);
  }

  /**
   * Event handler called when filters component updates list of matching apps.
   */
  public updateMatching() {
    // map component gets filtered apps

    this.mapApps = this.filterApps.filter(a => a.isMatches);
    // NB: OnChanges event will update the map
    this.appmap.resetMap();
  }

  /**
   * Event handler called when map component updates list of visible apps.
   */
  public updateVisible() {
    // list component gets visible apps
    this.listApps = this.mapApps.filter(a => a.isVisible);
    // NB: OnChanges event will update the list
  }

  /**
   * Event handler called when map component reset button is clicked.
   */
  public reloadApps() {
    this.getApps();
  }

  /**
   * Event handler called when list component selects or unselects an app.
   */
  public highlightProject(app: Project, show: boolean) {
    this.appmap.onHighlightProject(app, show);
  }

  /**
   * Called when list component visibility is toggled.
   */
  public toggleAppList() {
    this.configService.isApplistListVisible = !this.configService.isApplistListVisible;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
