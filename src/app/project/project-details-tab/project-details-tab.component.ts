import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import 'leaflet';
import 'assets/js/leaflet.shpfile.js';

import { StorageService } from 'app/services/storage.service';
import { Subject } from 'rxjs';
import { ConfigService } from 'app/services/config.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Document } from 'app/models/document';
import { CommentsResolver } from '../comments/comments-resolver.service';
import * as _ from 'lodash';

// need to import leaflet this way to include the shapefile->geojson plugin
declare let L;
const encode = encodeURIComponent;

@Component({
  selector: 'app-project-details-tab',
  templateUrl: './project-details-tab.component.html',
  styleUrls: ['./project-details-tab.component.scss'],
})
export class ProjectDetailsTabComponent implements OnInit, AfterViewInit, OnDestroy {
  public project;
  public commentPeriod = null;
  public map: L.Map = null;
  public appFG = L.featureGroup(); // group of layers for subject app
  public multipleExistingPlans: boolean;
  public overlappingDistrictsListString: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  readonly defaultBounds = L.latLngBounds([48, -139], [60, -114]); // all of BC
  private ngbModal: NgbModalRef = null;
  public shapefile: Document[] = [];
  public pathAPI: string;

  constructor(
    private storageService: StorageService,
    private elementRef: ElementRef,
    public configService: ConfigService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.project = this.storageService.state.currentProject.data;
    this.multipleExistingPlans = Array.isArray(this.project.existingLandUsePlans);
    this.overlappingDistrictsListString = this.stringifyOverlappingDistricts(this.project.overlappingRegionalDistricts);
    this.commentPeriod = this.project.commentPeriodForBanner;
    this.route.data.subscribe((res: any) => {
      if (res) {
        if (res.documents && res.documents[0].data.meta && res.documents[0].data.meta.length > 0) {
          this.shapefile = res.documents[0].data.searchResults;
        } else {
          this.shapefile = [];
        }
      }
    });
    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remote_api_path = window.localStorage.getItem('from_public_server--remote_api_base_path');
    this.pathAPI = (_.isEmpty(remote_api_path)) ? 'http://localhost:3000/api' : remote_api_path;
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
    if (this.shapefile[0] && this.shapefile[0].documentFileName && this.shapefile[0].documentFileName.length > 0) {
      console.log('Shapefile', this.shapefile);
      const escapedName = encode(this.shapefile[0].documentFileName).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '_').replace(/\//g, '_').replace(/\%2F/g, '_');
      const shapeurl = this.pathAPI + '/document/' + this.shapefile[0]._id + '/fetch/' + escapedName;
      const shapefile = new L.Shapefile(shapeurl, { isArrayBufer: false });
      let shapefileBounds = window.setInterval(function () {
        if (shapefile.getBounds().isValid() === true) {
          this.map.fitBounds(shapefile.getBounds(), {padding: [50, 50]});
          window.clearInterval(shapefileBounds);
        }
      }.bind(this), 500);
      shapefile.addTo(this.map);
    } else if (this.project) {
      console.log('No shapefille!', this.shapefile[0]);
      const markerIconYellow = L.icon({
        iconUrl: 'assets/images/marker-icon-yellow.svg',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        tooltipAnchor: [16, -28]
      });

      const title = `${this.project.name}\n`
        + `${this.project.overlappingRegionalDistricts}\n`;
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

  stringifyOverlappingDistricts(districts: string | string[]): string {
    let overlappingDistrictsListString: string;
    if (Array.isArray(districts) === true ) {
      overlappingDistrictsListString = (<string[]>districts).join(', ');
    } else {
      overlappingDistrictsListString = districts as string;
    }
    return overlappingDistrictsListString;
  }

  public fitBounds(bounds: L.LatLngBounds = null) {
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
}
