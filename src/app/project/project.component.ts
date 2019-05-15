import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as L from 'leaflet';

import { Project } from 'app/models/project';
import { ConfigService } from 'app/services/config.service';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { StorageService } from 'app/services/storage.service';
import { CommentPeriod } from 'app/models/commentperiod';
import { AddCommentComponent } from './comments/add-comment/add-comment.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly tabLinks = [
    { label: 'Commenting', link: 'commenting' },
    { label: 'Documents', link: 'documents' }
  ];

  public project: Project = null;
  public map: L.Map = null;
  public appFG = L.featureGroup(); // group of layers for subject app
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private ngbModal: NgbModalRef = null;
  public period: CommentPeriod = null;

  readonly defaultBounds = L.latLngBounds([48, -139], [60, -114]); // all of BC

  constructor(
    private elementRef: ElementRef,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router,
    private modalService: NgbModal,
    private renderer: Renderer2,
    public configService: ConfigService,
    public projectService: ProjectService, // used in template
    public commentPeriodService: CommentPeriodService // used in template
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: Project }) => {
          if (data.project) {
            this.storageService.state.currentProject = { type: 'currentProject', data: data.project };
            this.renderer.removeClass(document.body, 'no-scroll');
            this.project = data.project;

            // ***************************************************
            // TODO Resolve this period from the actual project.
            // Open
            this.period = new CommentPeriod({
              _id: '5980d4f8436253001dcaf8b8',
              informationLabel: 'Lorem Ipsum',
              dateStarted: '2019-01-17 22:03:52.162Z',
              dateCompleted: '2019-12-01 19:25:37.113Z'
            });
            // // Closed
            // this.period = new CommentPeriod({
            //   _id: '5980d4f8436253001dcaf8b8',
            //   informationLabel: 'Lorem Ipsum',
            //   dateStarted: '2019-01-17 22:03:52.162Z',
            //   dateCompleted: '2019-02-01 19:25:37.113Z'
            // });
            // Scheduled shouldn't show because non 7 day window
            // this.period = new CommentPeriod({
            //   _id: '5980d4f8436253001dcaf8b8',
            //   informationLabel: 'Lorem Ipsum',
            //   dateStarted: '2019-12-17 22:03:52.162Z',
            //   dateCompleted: '2019-12-22 19:25:37.113Z'
            // });
            // Scheduled fix this to be within 7 days of coding test
            // this.period = new CommentPeriod({
            //   _id: '5980d4f8436253001dcaf8b8',
            //   informationLabel: 'Lorem Ipsum',
            //   dateStarted: '2019-05-17 22:03:52.162Z',
            //   dateCompleted: '2019-05-18 19:25:37.113Z'
            // });
            console.log('period:', this.period);

          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  ngAfterViewInit() {
    const self = this; // for closure function below

    // custom control to reset map view
    const resetViewControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function (map) {
        const element = L.DomUtil.create('i', 'material-icons leaflet-bar leaflet-control leaflet-control-custom');

        element.title = 'Reset view';
        element.innerText = 'refresh'; // material icon name
        element.style.width = '34px';
        element.style.height = '34px';
        element.style.lineHeight = '30px';
        element.style.textAlign = 'center';
        element.style.cursor = 'pointer';
        element.style.backgroundColor = '#fff';
        element.onmouseover = () => element.style.backgroundColor = '#f4f4f4';
        element.onmouseout = () => element.style.backgroundColor = '#fff';

        element.onclick = function () {
          self.fitBounds(self.appFG.getBounds());
        };

        // prevent underlying map actions for these events
        L.DomEvent.disableClickPropagation(element); // includes double-click
        L.DomEvent.disableScrollPropagation(element);

        return element;
      },
    });

    // draw map
    const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
      maxZoom: 13,
      noWrap: true
    });
    const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
      maxZoom: 16,
      noWrap: true
    });
    const OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
      attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
      noWrap: true
    });
    const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      maxZoom: 16,
      noWrap: true
    });
    const World_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 17,
      noWrap: true
    });

    this.map = L.map('map', {
      zoomControl: false, // will be added manually below
      maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)), // restrict view to "the world"
      zoomSnap: 0.1 // for greater granularity when fitting bounds
    });

    // NB: don't need to handle map change events
    // since we always leave the subject app visible

    // add reset view control
    this.map.addControl(new resetViewControl());

    // add zoom control
    L.control.zoom({ position: 'topleft' }).addTo(this.map);

    // add scale control
    L.control.scale({ position: 'bottomright' }).addTo(this.map);

    // add base maps layers control
    const baseLayers = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'Open Surfer Roads': OpenMapSurfer_Roads,
      'World Topographic': World_Topo_Map,
      'World Imagery': World_Imagery
    };
    L.control.layers(baseLayers).addTo(this.map);

    // load base layer
    for (const key of Object.keys(baseLayers)) {
      if (key === this.configService.baseLayerName) {
        this.map.addLayer(baseLayers[key]);
        break;
      }
    }

    // save any future base layer changes
    this.map.on('baselayerchange', function (e: L.LayersControlEvent) {
      this.configService.baseLayerName = e.name;
    }, this);

    // Disable zoom on project details - iterferes with scrolling page.
    this.map.scrollWheelZoom.disable();

    // draw project marker
    if (this.project) {
      const markerIconYellow = L.icon({
        iconUrl: 'assets/images/marker-icon-yellow.svg',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        tooltipAnchor: [16, -28]
      });

      const title = `${this.project.name}\n`
      + `${this.project.sector}\n`
      + `${this.project.location}\n`;
      const marker = L.marker(L.latLng(this.project.centroid[1], this.project.centroid[0]), { title: title })
        .setIcon(markerIconYellow);
      this.map.addLayer(marker);
    }
    this.map.addLayer(this.appFG);

    this.fixMap();
  }

  // to avoid timing conflict with animations (resulting in small map tile at top left of page),
  // ensure map component is visible in the DOM then update it; otherwise wait a bit...
  // ref: https://github.com/Leaflet/Leaflet/issues/4835
  // ref: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  private fixMap() {
    if (this.elementRef.nativeElement.offsetParent) {
      this.fitBounds(this.appFG.getBounds());
    } else {
      setTimeout(this.fixMap.bind(this), 50);
    }
  }

  private fitBounds(bounds: L.LatLngBounds = null) {
    const fitBoundsOptions: L.FitBoundsOptions = {
      // disable animation to prevent known bug where zoom is sometimes incorrect
      // ref: https://github.com/Leaflet/Leaflet/issues/3249
      animate: false,
      // use bottom padding to keep shape in bounds
      paddingBottomRight: [0, 35]
    };

    if (bounds && bounds.isValid()) {
      this.map.fitBounds(bounds, fitBoundsOptions);
    } else {
      this.map.fitBounds(this.defaultBounds, fitBoundsOptions);
    }
  }

  ngOnDestroy() {
    if (this.ngbModal) { this.ngbModal.dismiss('component destroyed'); }
    if (this.map) { this.map.remove(); }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private gotoMap() {
    // pass along the id of the current project if available
    // so that the map component can show the popup for it
    const projectId = this.project ? this.project._id : null;
    this.router.navigate(['/map', { project: projectId }]);
  }

  private addComment() {
    if (this.period) {
      // open modal
      this.ngbModal = this.modalService.open(AddCommentComponent, { backdrop: 'static', size: 'lg' });
      // set input parameter
      (<AddCommentComponent>this.ngbModal.componentInstance).currentPeriod = this.period;
      // check result
      this.ngbModal.result.then(
        value => {
          // saved
          console.log(`Success, value = ${value}`);
        },
        reason => {
          // cancelled
          console.log(`Cancelled, reason = ${reason}`);
        }
      );
    }
  }
}
