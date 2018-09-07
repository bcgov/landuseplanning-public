import { Component, OnInit, OnChanges, OnDestroy, Input, ApplicationRef, SimpleChanges, Injector, ComponentFactoryResolver } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'leaflet';
import 'leaflet.markercluster';
import * as _ from 'lodash';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { ConfigService } from 'app/services/config.service';
import { AppDetailPopupComponent } from 'app/applications/app-detail-popup/app-detail-popup.component';

declare module 'leaflet' {
  export interface FeatureGroup<P = any> {
    dispositionId: number;
  }
  export interface Marker<P = any> {
    dispositionId: number;
  }
}

const L = window['L'];

const markerIconYellow = L.icon({
  iconUrl: 'assets/images/marker-icon-yellow.svg',
  iconRetinaUrl: 'assets/images/marker-icon-2x-yellow.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28]
});

const markerIconYellowLg = L.icon({
  iconUrl: 'assets/images/marker-icon-yellow-lg.svg',
  iconRetinaUrl: 'assets/images/marker-icon-2x-yellow-lg.svg',
  iconSize: [50, 82],
  iconAnchor: [25, 82],
  // popupAnchor: [1, -34], // TODO: update, if needed
  // tooltipAnchor: [16, -28] // TODO: update, if needed
});

@Component({
  selector: 'app-applist-map',
  templateUrl: './applist-map.component.html',
  styleUrls: ['./applist-map.component.scss']
})

export class ApplistMapComponent implements OnInit, OnChanges, OnDestroy {
  // NB: this component is bound to the same list of apps as the other components
  @Input() allApps: Array<Application> = []; // from applications component
  @Input() applist;
  @Input() appfilters;

  private map: L.Map = null;
  private markerList: L.Marker[] = []; // list of markers
  private currentMarker: L.Marker = null; // for removing previous marker
  private markerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40, // NB: change to 0 to disable clustering
    // iconCreateFunction: this.clusterCreate // FUTURE: for custom markers, if needed
  });
  private gotChanges = false; // to reduce initial map event handling
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  readonly defaultBounds = L.latLngBounds([48, -139], [60, -114]); // all of BC

  constructor(
    private appRef: ApplicationRef,
    public applicationService: ApplicationService,
    public configService: ConfigService,
    private injector: Injector,
    private resolver: ComponentFactoryResolver
  ) { }

  // // for creating custom cluster icon
  // private clusterCreate(cluster): L.Icon | L.DivIcon {
  //   const html = cluster.getChildcount().toString();
  //   return L.divIcon({ html: html, className: 'my-cluster', iconSize: L.point(40, 40) });
  // }

  public ngOnInit() {
    const self = this; // for closure function below

    // custom control to reset map view
    const resetViewControl = L.Control.extend({
      onAdd: function () {
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
        element.onclick = () => self.resetView();

        // prevent underlying map actions for these events
        L.DomEvent.disableClickPropagation(element); // includes double-click
        L.DomEvent.disableScrollPropagation(element);

        return element;
      },
    });

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

    // map state change events
    // this.map.on('zoomstart', function () {
    //   console.log('zoomstart');
    // }, this);

    // this.map.on('movestart', function () {
    //   console.log('movestart');
    // }, this);

    // this.map.on('resize', function () {
    //   console.log('resize');
    // }, this);

    // NB: moveend is called after zoomstart, movestart and resize
    this.map.on('moveend', function () {
      // console.log('moveend');
      // only set visible after init
      if (this.gotChanges) {
        this.setVisibleDebounced();
      }
    }, this);

    // add markers group
    this.map.addLayer(this.markerClusterGroup);

    // add reset view control
    this.map.addControl(new resetViewControl());

    // add zoom control
    L.control.zoom({ position: 'topright' }).addTo(this.map);

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

    // FUTURE: restore map bounds / center / zoom ?
    // this.fitGlobalBounds(this.configService.mapBounds);
    // this.map.setView(this.configService.mapCenter, this.configService.mapZoom);
  }

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.allApps && !changes.allApps.firstChange && changes.allApps.currentValue) {
      // console.log('map: got changed apps from applications component');

      this.gotChanges = true;

      // NB: don't need to draw map here -- event handler from filters will do it
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * May be called on map state change events.
   * Actual function executes no more than once every 250ms.
   */
  // tslint:disable-next-line:member-ordering
  private setVisibleDebounced = _.debounce(this.setVisible, 250);

  /**
   * Sets which apps are currently visible.
   * NB: Call setVisibleDebounced() instead!
   */
  private setVisible() {
    // console.log('setting visible');
    const mapBounds = this.map.getBounds();

    // FUTURE: central place to save map bounds / center /zoom ?
    // this.configService.mapBounds = mapBounds;
    // this.configService.mapCenter = this.map.getCenter();
    // this.configService.mapZoom = this.map.getZoom();

    for (const marker of this.markerList) {
      const app = _.find(this.allApps, { tantalisID: marker.dispositionId });
      if (app) {
        const markerLatLng = marker.getLatLng();

        if (!this.configService.doUpdateResults) {
          // show all items even if map moves
          app.isVisible = true;

        } else if (mapBounds.contains(markerLatLng)) {
          // map contains marker - make item visible
          app.isVisible = true;

        } else {
          // map doesn't contains marker - make item hidden and unload it from list
          app.isVisible = false;
        }
      }
    }

    // NB: change detection will update all components bound to apps list
  }

  private fitGlobalBounds(bounds: L.LatLngBounds) {
    // console.log('fitting bounds');
    const x = this.configService.isApplistListVisible ? this.applist.clientWidth : 0;
    const y = this.appfilters.clientHeight; // filters are always visible
    const fitBoundsOptions: L.FitBoundsOptions = {
      // use top/left padding to adjust for list and/or filters
      paddingTopLeft: L.point(x, y),
      // use bottom padding to keep shapes in bounds
      paddingBottomRight: [0, 25],
      // disable animation to prevent known bug where zoom is sometimes incorrect
      // ref: https://github.com/Leaflet/Leaflet/issues/3249
      animate: false
    };

    if (bounds && bounds.isValid()) {
      this.map.fitBounds(bounds, fitBoundsOptions);
    } else {
      this.map.fitBounds(this.defaultBounds, fitBoundsOptions);
    }
  }

  /**
   * Resets map view to display all markers.
   */
  private resetView() {
    // console.log('resetting view');
    const globalFG = L.featureGroup();

    for (const marker of this.markerList) {
      marker.addTo(globalFG);
    }

    // fit the global bounds
    this.fitGlobalBounds(globalFG.getBounds());
  }

  /**
   * Called when list of apps changes.
   */
  private drawMap() {
    // console.log('drawing map, allApps =', this.allApps);
    const globalFG = L.featureGroup();

    // clear all markers and empty the list
    this.markerClusterGroup.clearLayers();
    this.markerList.length = 0;

    // TODO: delete isMatches (everywhere) when API performs filtering
    this.allApps.filter(a => a.isMatches).forEach(app => {
      // add marker
      if (app.centroid.length === 2) { // safety check
        const title = `${app.client}\n`
          + `${app['appStatus']}\n`
          + `${app.location}\n`;
        const marker = L.marker(L.latLng(app.centroid[1], app.centroid[0]), { title: title })
          .setIcon(markerIconYellow)
          .on('click', L.Util.bind(this.onMarkerClick, this, app));
        marker.dispositionId = app.tantalisID;
        this.markerList.push(marker); // save to list
        this.markerClusterGroup.addLayer(marker); // save to marker/clusters layer
      }
    });

    // fit view to shapes/markers
    this.resetView();
  }

  private onMarkerClick(...args: any[]) {
    const app = args[0] as Application;
    const marker = args[1].target as L.Marker;

    // this.applist.toggleCurrentApp(app); // update selected item in app list // FUTURE ?

    const popupOptions = {
      maxWidth: 400,
      className: 'map-popup-content',
      autoPanPadding: L.point(40, 40)
    };

    // compile marker popup
    const compFactory = this.resolver.resolveComponentFactory(AppDetailPopupComponent);
    const compRef = compFactory.create(this.injector);
    compRef.instance.app = app;
    this.appRef.attachView(compRef.hostView);
    compRef.onDestroy(() => this.appRef.detachView(compRef.hostView));
    const div = document.createElement('div').appendChild(compRef.location.nativeElement);

    L.popup(popupOptions)
      .setLatLng(marker.getLatLng())
      .setContent(div)
      .openOn(this.map);
  }

  /**
   * Called when list component selects or unselects an app.
   */
  public highlightApplication(app: Application, show: boolean) {
    // reset icon on previous marker, if any
    if (this.currentMarker) {
      this.currentMarker.setIcon(markerIconYellow);
      this.currentMarker = null;
    }

    // set icon on new marker
    if (show) {
      const marker = _.find(this.markerList, { dispositionId: app.tantalisID });
      if (marker) {
        this.currentMarker = marker;
        marker.setIcon(markerIconYellowLg);
        // this.centerMap(marker.getLatLng()); // FUTURE ?
        // FUTURE: zoom in to this app/marker ?
      }
    }
  }

  /**
   * Center map on specified point, applying offset if needed.
   */
  // TODO: register for list/filter changes and apply offset accordingly ?
  private centerMap(latlng: L.LatLng) {
    let point = this.map.latLngToLayerPoint(latlng);

    if (this.configService.isApplistListVisible) {
      point = point.subtract([(this.applist.clientWidth / 2), 0]);
    }

    point = point.subtract([0, (this.appfilters.clientHeight / 2)]); // filters are always visible

    this.map.panTo(this.map.layerPointToLatLng(point));
  }

  /**
   * Called when filters component updates list of matching apps.
   */
  // FUTURE: move Update Matching to common config and register for changes ?
  public onUpdateMatching(apps: Application[]) {
    // can't update properties in current change detection cycle
    // so do it in another event
    setTimeout(() => {
      // NB: change detection will update all components bound to apps list

      // (re)draw the matching apps (only after init)
      if (this.gotChanges) {
        this.drawMap();
      }
    }, 0);
  }

  /**
   * Called when Update Results checkbox has changed.
   */
  // FUTURE: change doUpdateResults to observable and subscribe to changes ?
  public onUpdateResultsChange() {
    this.setVisibleDebounced();
  }

  /**
   * Called when list component visibility is toggled.
   */
  public toggleAppList() {
    this.configService.isApplistListVisible = !this.configService.isApplistListVisible;
    const x = this.configService.isApplistListVisible ? -this.applist.clientWidth / 2 : this.applist.clientWidth / 2;
    const y = 0;
    this.map.panBy(L.point(x, y));
  }
}
