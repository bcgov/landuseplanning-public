import { Component, AfterViewInit, OnChanges, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ApplicationRef, ElementRef, SimpleChanges, Injector, ComponentFactoryResolver } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { Project } from 'app/models/project';
import { ProjectService } from 'app/services/project.service';
import { ConfigService } from 'app/services/config.service';
import { ScriptLoaderService } from 'app/services/scriptLoader.service';
import { ProjDetailPopupComponent } from 'app/projects/proj-detail-popup/proj-detail-popup.component';
import { Constants } from 'app/shared/utils/constants';
import { Utils } from 'app/shared/utils/utils';
import { animate, style, transition, trigger } from '@angular/animations';
import type { MarkerClusterGroup, Map, GeoJSON, Marker, Icon, LatLngBounds, LayersControlEvent, FitBoundsOptions } from 'leaflet';

@Component({
  selector: 'app-projlist-map',
  templateUrl: './projlist-map.component.html',
  styleUrls: ['./projlist-map.component.scss'],
  animations: [trigger('fade', [transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))])])]
})

export class ProjlistMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  // NB: this component is bound to the same list of apps as the other components
  @Input() projects: Array<Project> = []; // from projects component
  @Input() applist; // from projects component
  @Input() appfilters; // from projects component
  @Output() updateVisible = new EventEmitter(); // to projects component
  @Output() reloadApps = new EventEmitter(); // to projects component
	@ViewChild('map') private mapContainer: ElementRef;

  public pathAPI: string;
  public loading = true;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private map: Map = null;
  private shapefileList: GeoJSON[] = [];
  private markerList: Marker[] = []; // list of markers
  private currentMarker: Marker = null; // for removing previous marker
  private markerClusterGroup: MarkerClusterGroup = null;
  private markerIconYellow: Icon = null;
  private markerIconYellowLg: Icon = null;
  private defaultBounds: LatLngBounds = null;
  private L: typeof import('leaflet');

  constructor(
    private appRef: ApplicationRef,
    private elementRef: ElementRef,
    public projectService: ProjectService,
    public configService: ConfigService,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private utils: Utils,
    private scriptLoader: ScriptLoaderService,
    private router: Router,
  ) { }

  // create map after view (which contains map id) is initialized
  async ngAfterViewInit() {
    try {
      await this.scriptLoader.loadStyles([
      '/leaflet/leaflet.css',
      '/leaflet-markercluster/MarkerCluster.css',
      '/leaflet-markercluster/MarkerCluster.Default.css'
    ]);
    } catch (e) {
      console.error('One or more style sheets failed to load', e);
      alert('Uh-oh, the map failed to load. You will be redirected to the homepage.');
      this.router.navigate(['/']);
    }
    
    try {
      // Load prerequisite scripts
      await this.scriptLoader.loadScripts([
        '/maplibre-gl/maplibre-gl.js',
        '/leaflet/leaflet.js',
      ]);
      // Load subsequent scripts
      await this.scriptLoader.loadScripts([
        '/esri-leaflet/esri-leaflet.js',
        '/esri-leaflet-vector/esri-leaflet-vector.js',
        '/leaflet-ajax/leaflet.ajax.js',
        '/shpjs/shp.min.js',
        '/leaflet-shpfile/leaflet.shpfile.js',
        '/leaflet-markercluster/leaflet.markercluster.js',
      ]);
    } catch (e) {
      console.error('One or more scripts failed to load', e);
      alert('Uh-oh, the map failed to load. You will be redirected to the homepage.');
      this.router.navigate(['/']);
    }

    this.L = (window as any).L;

    this.defaultBounds = this.L.latLngBounds([48, -139], [60, -114]); // all of BC
    
    this.markerIconYellow = this.L.icon({
      iconUrl: 'assets/images/marker-icon-yellow.svg',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      tooltipAnchor: [16, -28]
    });

    this.markerIconYellowLg = this.L.icon({
      iconUrl: 'assets/images/marker-icon-yellow-lg.svg',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });

    this.markerClusterGroup = this.L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40, // NB: change to 0 to disable clustering
    });

    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remoteApiPath = window.localStorage.getItem('from_public_server--remote_api_base_path');
    this.pathAPI = (_.isEmpty(remoteApiPath)) ? 'http://localhost:3000/api' : remoteApiPath;

    // for closure function below
    const self = this; 
    const L_ = this.L;

    // custom control to reset map view
    const resetViewControl = this.L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: function () {
        const element = L_.DomUtil.create('button');

        element.title = 'Reset view';
        element.innerText = 'refresh'; // material icon name
        element.onclick = () => self.resetView();
        element.className = 'material-icons map-reset-control';

        // prevent underlying map actions for these events
        L_.DomEvent.disableClickPropagation(element); // includes double-click
        L_.DomEvent.disableScrollPropagation(element);

        return element;
      },
    });

		// Declare the basemap layers
		const Esri_BC_Basemap = this.L.esri.Vector.vectorBasemapLayer("bbe05270d3a642f5b62203d6c454f457", {
			token: "AAPK22185e2b89234d44a13e17d56be107baT24tgFM0N7tI5fRSqvi4IP3_MF167rsx01IUHtYBqmQhNgw9LCDxmRtT2F3rQdqh",
		});
		const Esri_OceanBasemap = this.L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
      maxZoom: 13,
      noWrap: true
    });
    const Esri_NatGeoWorldMap = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
      maxZoom: 16,
      noWrap: true
    });
    const World_Topo_Map = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      maxZoom: 16,
      noWrap: true
    });
    const World_Imagery = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 17,
      noWrap: true
    });

		// Declare the map with some parameters
    this.map = this.L.map(this.mapContainer.nativeElement, {
      zoomControl: false, // will be added manually below
      maxBounds: this.L.latLngBounds(this.L.latLng(-90, -180), this.L.latLng(90, 180)), // restrict view to "the world"
			maxZoom: 17,
      zoomSnap: 0.1, // for greater granularity when fitting bounds
      attributionControl: false
    });

		// NB: moveend is called after zoomstart, movestart and resize
    this.map.once('moveend', function () {
      this.setVisibleDebounced();
    }, this);

    // add markers group
    this.map.addLayer(this.markerClusterGroup);

		// add base maps layers control
		const baseLayers = {
			'BC Basemap': Esri_BC_Basemap,
			'Ocean Base': Esri_OceanBasemap,
			'Nat Geo World Map': Esri_NatGeoWorldMap,
			'World Topographic': World_Topo_Map,
			'World Imagery': World_Imagery
		};
		this.L.control.layers(baseLayers, null, { position: 'topright' }).addTo(this.map);

		// map attribution
		this.L.control.attribution({ position: 'bottomright' }).addTo(this.map);

		// add scale control
		this.L.control.scale({ position: 'bottomleft' }).addTo(this.map);

		// add zoom control
		this.L.control.zoom({ position: 'bottomright' }).addTo(this.map);

		// add reset view control
		this.map.addControl(new resetViewControl());

		// load base layer
		for (const key of Object.keys(baseLayers)) {
			if (key === this.configService.baseLayerName) {
				this.map.addLayer(baseLayers[key]);
				break;
			}
		}

    // Add "map loaded" listener for removing loading screen
    // Must add additional timeout to account for vector tile rendering
    // Base the timeout delay on user connection speed
    this.map.once('moveend', () => {
      this.utils.getConnectionTier().then((tier) => {
        // Convert the returned connection speed to a millisecond value
        const delay = { slow: 3500, medium: 3000, fast: 2500, turbo: 2000 }[tier];
        // Set a timeout for removing the loading screen using the calculated value
        setTimeout(() => this.loading = false, delay);
      });
    });

		// save any future base layer changes
		this.map.on('baselayerchange', function (e: LayersControlEvent) {
			this.configService.baseLayerName = e.name;
		}, this);

		this.fixMap();

    if (this.projects?.length > 0 && this.L && this.map) {
      this.drawMap([], this.projects);
    }
  }

  // to avoid timing conflict with animations (resulting in small map tile at top left of page),
  // ensure map component is visible in the DOM then update it; otherwise wait a bit...
  // ref: https://github.com/Leaflet/Leaflet/issues/4835
  // ref: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  private fixMap() {
    if (this.elementRef.nativeElement.offsetParent) {
      this.fitBounds(); // use default bounds
    } else {
      setTimeout(this.fixMap.bind(this), 50);
    }
  }

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    if (!this.L || !this.map) return;
    if (changes.projects && !changes.projects.firstChange && changes.projects.currentValue) {
      const deletedApps = _.difference(changes.projects.previousValue, changes.projects.currentValue) as Array<Project>;
      const addedApps = _.difference(changes.projects.currentValue, changes.projects.previousValue) as Array<Project>;

      // (re)draw the matching apps
      this.drawMap(deletedApps, addedApps);
    }
  }

  public ngOnDestroy() {
    if (this.map) { this.map.remove(); }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
    * Resets map view.
    */
  private resetView() {
    this.fitBounds(); // use default bounds
  }

  /**
   * Sets which apps are currently visible.
   * Actual function executes no more than once every 250ms.
   */
  // tslint:disable-next-line:member-ordering
  private setVisibleDebounced = _.debounce(this.setVisible, 250);

  /**
   * NB: Call setVisibleDebounced() instead!
   */
  private setVisible() {
    const mapBounds = this.map.getBounds();

    // update visibility for apps with markers only
    // ie, leave apps without markers 'visible' (as initialized)
    for (const marker of this.markerList as Marker[]) {
      const project = _.find(this.projects, { _id: marker.projectId });
      if (project) {
        const markerLatLng = marker.getLatLng();
        // app is visible if map contains its marker
        project.isVisible = mapBounds.contains(markerLatLng);
      }
    }

    // notify list component
    this.updateVisible.emit();
  }

  private fitBounds(bounds: LatLngBounds = this.defaultBounds) {
    const fitBoundsOptions: FitBoundsOptions = {
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
    * Removes hidden projects and draws added projects.
    *
    * @param   {Project[]} hiddenProjects Hidden projects.
    * @param   {Project[]} addedProjects Added projects.
    * @returns {void}
    */
  private drawMap(hiddenProjects: Project[], addedProjects: Project[]): void {
    // remove hidden projects from list and map
    hiddenProjects.forEach(proj => {

      if (this.markerList?.length > 0) {
        // Find marker indexes
        const markerIndexes = this.markerList.reduce((acc, item, index) => {
        if (item.projectId?.toString() === proj._id) acc.push(index);
          return acc;
        }, []);

        // Remove the markers from the map at the specified indexes
        if (markerIndexes.length > 0) {
          markerIndexes.sort((a, b) => b - a).forEach(mi => {
            const [marker] = this.markerList.splice(mi, 1);
            if (marker) {
              this.markerClusterGroup.removeLayer(marker);
            }
          })
        }
      }
      
      if (this.shapefileList?.length > 0) {
        // Find shapefile indexes
        const shapefileIndexes = this.shapefileList.reduce((acc, item, index) => {
        if (item.projectId?.toString() === proj._id) acc.push(index);
          return acc;
        }, []);

        // Remove the shapefiles from the map at the specified indexes
        if (shapefileIndexes.length > 0) {
          shapefileIndexes.sort((a, b) => b - a).forEach(sfi => {
            const [shapefile] = this.shapefileList.splice(sfi, 1);
            if (shapefile) {
              this.map.removeLayer(shapefile);
            }
          })
        }
      }
    });

    // draw added projects
    addedProjects.forEach(proj => {
      // If there is a shapefile for one of the projects, display it instead of a pin.
      if (proj.shapefiles && proj.shapefiles.length > 0) {
        // Get the project link, shapefile colour, and order before adding each shapefile to the global list.
        proj.shapefiles.forEach(projectShapefile => {
          if (!projectShapefile?.showOnMapPage) {
            // Colour value from the individual shapefile OR global project colour OR default constant colour
            const colour = projectShapefile.colour || proj.shapeFileColour || Constants.style.DEFAULT_SHAPEFILE_COLOUR;
            const shapeFileStyle = { color: colour };
            const escapedName = this.utils.encodeFileName(projectShapefile.documentFileName);
            const shapeurl = this.pathAPI + '/document/' + projectShapefile.document + '/fetch/' + escapedName;
            const shapefile = new this.L.Shapefile(shapeurl, { isArrayBufer: false, style: shapeFileStyle })
              .on('click', this.L.Util.bind(this.onShapefileClick, this, proj, projectShapefile.title));
            shapefile.projectId = proj._id;
            shapefile.shapefileOrder = Number(projectShapefile.order);
            this.shapefileList.push(shapefile);
          }
        })
      } else {
        // If no shapefile is found for a project, display a pin of its coordinates instead.
        if (this.utils.markerMeetsConditions(proj)) {
          const title = `${proj.name}\n`
          + `${proj.overlappingRegionalDistricts}\n`;
          const marker = this.L.marker(this.L.latLng(proj.centroid[1], proj.centroid[0]), { keyboard: true, title: title })
          .setIcon(this.markerIconYellow)
          .on('click', this.L.Util.bind(this.onMarkerClick, this, proj));
          marker.projectId = proj._id;
          this.markerList.push(marker); // save to list
          this.markerClusterGroup.addLayer(marker); // save to marker clusters group
        }
      }
    });
    // set visible apps
    this.addShapefilesToMap();
    this.setVisibleDebounced();
  }

  /**
   * Take the list of all project shapefiles, order them by "shapefileOrder",
   * then add them to the map.
   */
  private addShapefilesToMap(): void {
    const orderedShapefiles = _.sortBy(this.shapefileList, ['shapefileOrder']);
    orderedShapefiles.forEach(projectShapefile => {
      projectShapefile.addTo(this.map);
    });
  }

  /**
   * When the user clicks on a point, show a popup with information about
   * the project marker.
   *
   * @param {Array} args Leaflet objects passed to click handler.
   * @returns {void}
   */
  private onMarkerClick(...args: any[]) {
    const app = args[0] as Project;
    const marker = args[1].target as Marker;

    // update selected item in app list.
    this.applist.toggleCurrentApp(app);

    // if there's already a popup, delete it.
    let popup = marker.getPopup();
    if (popup) {
      const wasOpen = popup.isOpen();
      popup.remove();
      marker.unbindPopup();
      if (wasOpen) { return; }
    }

    const popupOptions = this.getPopupOptions();
    const getPopupComponent = this.getPopupComponent(app, '');

    popup = this.L.popup(popupOptions)
      .setLatLng(marker.getLatLng())
      .setContent(getPopupComponent);

    // bind popup to marker so it automatically closes when marker is removed
    marker.bindPopup(popup).openPopup();
  }

  /**
   * When the user clicks on a shapefile, show a popup with information about
   * the project shapefile.
   *
   * @param {Array} args Leaflet objects passed to click handler.
   * @returns {void}
   */
  private onShapefileClick(...args: any[]): void {
    const app = args[0] as Project;
    const shapefileTitle = args[1];
    const shapefile = args[2];
    // update selected item in app list.
    this.applist.toggleCurrentApp(app);

    // if there's already a popup, delete it.
    let popup = shapefile.target.getPopup();
    if (popup) {
      const wasOpen = popup.isOpen();
      popup.remove();
      shapefile.layer.unbindPopup();
      if (wasOpen) { return; }
    }

    const popupOptions = this.getPopupOptions();
    const getPopupComponent = this.getPopupComponent(app, shapefileTitle);

    popup = this.L.popup(popupOptions)
      .setLatLng(shapefile.latlng)
      .setContent(getPopupComponent);

    // bind popup to specific layer so it automatically closes when marker is removed.
    shapefile.layer.bindPopup(popup).openPopup();
  }

  /**
   * Dynamically adjusts the popup size to depending on the size of the
   * map so the popup isn't too large.
   *
   * @returns {Object}
   */
  private getPopupOptions(): Object {
    const popupOptions = {
      className: 'map-popup-content',
      autoPanPaddingTopLeft: null,
      autoPanPaddingBottomRight: null
    };

    // Fix for different viewports on scrolling for map display
    if (this.map.getSize().y < 800) {
      popupOptions.autoPanPaddingTopLeft = this.L.point(2, 350);
      popupOptions.autoPanPaddingBottomRight = this.L.point(2, 30);
    } else {
      popupOptions.autoPanPaddingTopLeft = this.L.point(80, 200);
      popupOptions.autoPanPaddingBottomRight = this.L.point(80, 30);
    }
    return popupOptions;
  }

  /**
   * Generates the content for the popup.
   *
   * @param {Project} project The project to pass to the component factory.
   * @returns {HTMLElement}
   */
  private getPopupComponent(project: Project, shapefileTitle: string): HTMLElement {
    const compFactory = this.resolver.resolveComponentFactory(ProjDetailPopupComponent);
    const compRef = compFactory.create(this.injector);
    compRef.instance.proj = project;
    compRef.instance.shapefileTitle = shapefileTitle;
    this.appRef.attachView(compRef.hostView);
    compRef.onDestroy(() => this.appRef.detachView(compRef.hostView));
    return document.createElement('div').appendChild(compRef.location.nativeElement);
  }

  /**
   * Called when list component selects or unselects an app.
   */
  public onHighlightProject(app: Project, show: boolean) {
    // reset icon on previous marker, if any
    if (this.currentMarker) {
      this.currentMarker.setIcon(this.markerIconYellow);
      this.currentMarker = null;
    }

    // set icon on new marker
    if (show) {
      const marker = _.find(this.markerList, { projectId: app._id });
      if (marker) {
        this.currentMarker = marker;
        marker.setIcon(this.markerIconYellowLg);
      }
    }
  }

  public resetMap() {
    this.fitBounds(); // use default bounds
  }

  public onLoadStart() { this.loading = true; }

  public onLoadEnd() {}
}
