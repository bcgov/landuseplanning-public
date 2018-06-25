import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Application } from 'app/models/application';
import { SearchService } from 'app/services/search.service';
import { ConfigService } from 'app/services/config.service';
import { Subject } from 'rxjs/Subject';
import 'leaflet.markercluster';
import * as L from 'leaflet';
import * as _ from 'lodash';

declare module 'leaflet' {
  export interface FeatureGroup<P = any> {
    dispositionId: number;
  }
}

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
  // popupAnchor: [1, -34], // TODO: update
  // tooltipAnchor: [16, -28] // TODO: update
});

@Component({
  selector: 'app-applist-map',
  templateUrl: './applist-map.component.html',
  styleUrls: ['./applist-map.component.scss']
})

export class ApplistMapComponent implements OnInit, OnChanges, OnDestroy {
  // NB: this component is bound to the same list of apps as the other components
  @Input() allApps: Array<Application> = []; // from applications component

  public loading = true; // for spinner
  private map: L.Map = null;
  private appsFG: L.FeatureGroup[] = []; // groups of layers for each app
  private currentMarker: L.Marker = null; // for highlighting an app
  public currentApp: Application = null; // for highlighting an app
  private markersCG = L.markerClusterGroup();
  private fitBoundsOptions: L.FitBoundsOptions = {
    // disable animation to prevent known bug where zoom is sometimes incorrect
    // ref: https://github.com/Leaflet/Leaflet/issues/3249
    // animate: false, // TODO: seems to work correctly currently
    // right padding to keep right of shape in bounds
    // paddingBottomRight: [150, 10] // TODO: no longer needed?
  };
  private isUser = false; // to track map change events
  private gotChanges = false; // to reduce initial map change event handling
  private doUpdateResults: boolean = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private configService: ConfigService
  ) { }

  public ngOnInit() {
    const self = this; // for nested functions

    // custom control to reset map view
    const resetViewControl = L.Control.extend({
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
      layers: [World_Imagery],
      zoomControl: false
    });

    // map state change events
    this.map.on('zoomstart', function () {
      self.isUser = true;
    });
    this.map.on('movestart', function () {
      self.isUser = true;
    });
    this.map.on('resize', function () {
      self.isUser = true;
    });
    // NB: moveend is called after zoomstart, movestart and resize
    this.map.on('moveend', function () {
      // only reset visible after init
      if (self.gotChanges && self.isUser) {
        self.isUser = false;
        self.setVisibleDebounced();
      }
    });

    // add reset view control
    this.map.addControl(new resetViewControl());

    // add zoom control
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // add base maps layers control
    const baseMaps = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'Open Surfer Roads': OpenMapSurfer_Roads,
      'World Topographic': World_Topo_Map,
      'World Imagery': World_Imagery
    };
    L.control.layers(baseMaps).addTo(this.map);

    // add scale control
    L.control.scale({ position: 'bottomright' }).addTo(this.map);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!changes.allApps.firstChange && changes.allApps.currentValue) {
      // console.log('map: got changed apps from applications');

      this.gotChanges = true;

      // NB: don't need to draw map here -- event handler from filters will do it
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Called on map state change events.
   * Actual function executes no more than once per 250ms.
   */
  // tslint:disable-next-line:member-ordering
  private setVisibleDebounced = _.debounce(this.setVisible, 250);

  /**
   * Sets which apps are currently visible.
   * NB: Call setVisibleDebounced() instead!
   */
  private setVisible() {
    // console.log('resetting visible');
    // console.log('zoom =', this.map.getZoom());
    const bounds = this.map.getBounds();

    for (const fg of this.appsFG) {
      const fgBounds = fg.getBounds();

      if (!this.doUpdateResults) {
        // show all items even if map moves
        const app = _.find(this.allApps, { tantalisID: fg.dispositionId });
        if (app) { app.isVisible = true; }

      } else if (fgBounds && !fgBounds.isValid()) {
        // item without features - make item visible
        const app = _.find(this.allApps, { tantalisID: fg.dispositionId });
        if (app) { app.isVisible = true; }

      } else if (fgBounds && fgBounds.isValid() && bounds.intersects(fgBounds)) {
        // bounds intersect - make item visible
        const app = _.find(this.allApps, { tantalisID: fg.dispositionId });
        if (app) { app.isVisible = true; }

      } else {
        // invalid bounds, or bounds don't intersect - make item hidden
        const app = _.find(this.allApps, { tantalisID: fg.dispositionId });
        // console.log('hidden item, app =', app);
        if (app) { app.isVisible = false; }
      }
    }

    // NB: change detection will update all components bound to apps list
  }

  /**
   * Resets map view to display all apps.
   */
  private resetView() {
    const globalFG = L.featureGroup();

    for (const fg of this.appsFG) {
      fg.addTo(globalFG);
    }

    // fit the global bounds
    const globalBounds = globalFG.getBounds();
    if (globalBounds && globalBounds.isValid()) {
      this.map.fitBounds(globalBounds, this.fitBoundsOptions);
    }
  }

  /**
   * Called when list of apps changes.
   */
  private drawMap() {
    // console.log('drawing map');
    const self = this; // for nested functions
    const globalFG = L.featureGroup();

    // remove and clear all layers for all apps
    for (const fg of this.appsFG) {
      fg.removeFrom(this.map);
      fg.clearLayers();
    }

    // DEBUGGING
    // let n = 0;
    // this.map.eachLayer(() => n++);
    // console.log('# map layers =', n);

    // empty the list
    this.appsFG.length = 0;

    this.allApps.filter(a => a.isMatches).forEach(app => {
      const appFG = L.featureGroup(); // layers for current app
      appFG.dispositionId = app.tantalisID;

      // draw features for this app
      app.features.forEach(f => {
        const feature = JSON.parse(JSON.stringify(f));
        // needs to be valid GeoJSON
        delete f.geometry_name;
        const featureObj: GeoJSON.Feature<any> = feature;
        const layer = L.geoJSON(featureObj, {
          filter: function (geoJsonFeature) {
            return true; // FUTURE: could use this to make feature invisible (not shown on map)
          }
        });
        const popupOptions = {
          maxWidth: 360, // worst case (Pixel 2)
          className: '' // FUTURE: for better styling control
        };
        const htmlContent = '<h3>' + featureObj.properties.TENURE_TYPE
          + '<br />'
          + featureObj.properties.TENURE_SUBTYPE + '</h3>'
          + '<strong>Shape: </strong>' + featureObj.properties.INTRID_SID
          + '<br />'
          + '<strong>Disposition Transaction ID: </strong>' + featureObj.properties.DISPOSITION_TRANSACTION_SID
          + '<br />'
          + '<strong>Purpose: </strong>' + featureObj.properties.TENURE_PURPOSE
          + '<br />'
          + '<strong>Sub Purpose: </strong>' + featureObj.properties.TENURE_SUBPURPOSE
          + '<br />'
          + '<strong>Stage: </strong>' + featureObj.properties.TENURE_STAGE
          + '<br />'
          + '<strong>Status: </strong>' + featureObj.properties.TENURE_STATUS
          + '<br />'
          + '<strong>Hectares: </strong>' + featureObj.properties.TENURE_AREA_IN_HECTARES
          + '<br />'
          + '<br />'
          + '<strong>Legal Description: </strong>' + featureObj.properties.TENURE_LEGAL_DESCRIPTION;
        const popup = L.popup(popupOptions).setContent(htmlContent);
        layer.bindPopup(popup);
        layer.addTo(appFG);

        const marker = L.marker(appFG.getBounds().getCenter())
          .setIcon(markerIconYellow)
          .on('click', L.Util.bind(self.onMarkerClick, self, app))
          .addTo(self.markersCG);
      });
      self.appsFG.push(appFG); // save to list
      appFG.addTo(self.map); // add to map
      appFG.addTo(globalFG); // for bounds
      // appFG.on('click', (event) => console.log('app =', app)); // FUTURE: highlight this app in list?

      self.markersCG.addTo(self.map);
    });

    // fit the global bounds
    const globalBounds = globalFG.getBounds();
    if (globalBounds && globalBounds.isValid()) {
      this.map.fitBounds(globalBounds, this.fitBoundsOptions);
    }

    this.loading = false;
  }

  /**
   * Event handler called when list component selects or unselects an app.
   */
  // TODO: this should do the same thing as clicking on a pin
  // TODO: pin should get larger and details popup should display
  // TODO: clicking on pin should select app in list
  public highlightApplication(app: Application, show: boolean) {

    //
    // TODO: find subject marker, then size it accordingly
    //

    // remove existing marker, if any
    if (this.currentMarker) {
      this.currentMarker.removeFrom(this.map);
      this.currentMarker = null;
    }

    if (show && app.features.length) {
      const fg = _.find(this.appsFG, { dispositionId: app.tantalisID });
      if (fg) {
        const center = fg.getBounds().getCenter();

        // add new marker
        this.currentMarker = L.marker(center)
          .setIcon(markerIconYellowLg)
          .on('click', L.Util.bind(this.onMarkerClick, this, app))
          .addTo(this.map);

        this.centerMap(center);
      }
    }
  }

  private onMarkerClick(...args: any[]) {
    const app = args[0] as Application;
    const marker = args[1].target as L.Marker;

    this.currentApp = app; // update selected item in app list
    // marker.setIcon(markerIconYellowLg);
    this.centerMap(marker.getLatLng());
  }

  /**
   * Center map on specified point, applying offset if needed.
   */
  // TODO: register for list/filter changes and apply offset accordingly?
  private centerMap(latlng: L.LatLng) {
    let point = this.map.latLngToLayerPoint(latlng);

    if (this.configService.isApplistListVisible) { point = point.subtract([(336 / 2), 0]); } // TODO: retrieve actual width of list pane
    if (this.configService.isApplistFiltersVisible) { point = point.add([0, (281 / 2)]); } // TODO: retrieve actual height of filters pane
    this.map.panTo(this.map.layerPointToLatLng(point));
  }

  /**
   * Event handler called when filters component updates list of matching apps.
   */
  // FUTURE: move Update Matching to common config and register for changes?
  public onUpdateMatching(apps: Application[]) {
    // console.log('map: got changed matching apps from filters');

    // can't update properties in current change detection cycle
    // so do it in another event
    setTimeout(() => {
      // NB: change detection will update all components bound to apps list

      // (re)draw the matching apps
      this.drawMap();
    }, 0, apps);
  }

  /**
   * Event handler called when list component Update Results checkbox has changed.
   */
  // FUTURE: move Update Results to common config and register for changes?
  public onUpdateResultsChange(doUpdateResults: boolean) {
    this.doUpdateResults = doUpdateResults;
    this.setVisibleDebounced();
  }
}
