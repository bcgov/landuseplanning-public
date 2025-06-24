import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import 'leaflet';
import 'assets/js/leaflet.shpfile.js';
import { vectorBasemapLayer } from "esri-leaflet-vector";
import { StorageService } from 'app/services/storage.service';
import { Constants } from 'app/shared/utils/constants';
import { Subject } from 'rxjs';
import { ConfigService } from 'app/services/config.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Document } from 'app/models/document';
import { ProjectShapefile } from 'app/models/project';
import * as _ from 'lodash';
import { Utils } from 'app/shared/utils/utils';
import { animate, style, transition, trigger } from '@angular/animations';

// need to import leaflet this way to include the shapefile->geojson plugin
declare let L;

@Component({
  selector: 'app-project-details-tab',
  templateUrl: './project-details-tab.component.html',
  styleUrls: ['./project-details-tab.component.scss'],
  animations: [trigger('fade', [transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))])])]
})
export class ProjectDetailsTabComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('map') private mapContainer: ElementRef;
  public project;
  public loading = true;
  public commentPeriod = null;
  public map: L.Map = null;
  public appFG = L.featureGroup(); // group of layers for subject app
  public multipleExistingPlans: boolean;
  public overlappingDistrictsListString: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  readonly defaultBounds = L.latLngBounds([48, -139], [61, -114]); // all of BC
	readonly defaultBoundsObject = {southWest: {lat: 48, lng: -139}, northEast: {lat: 61, lng: -114}}; // Converted for other parsing
	public bounds = {southWest: {lat: null, lng: null}, northEast: {lat: null, lng: null}}; // Bounds object for keeping track of bounds
  private ngbModal: NgbModalRef = null;
  public shapefiles: Document[] = [];
	public convertedShapefiles = [];
  public pathAPI: string;

  constructor(
    private storageService: StorageService,
    private elementRef: ElementRef,
    public configService: ConfigService,
    private route: ActivatedRoute,
    private utils: Utils,
  ) { }

  ngOnInit() {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.project = this.storageService.state.currentProject.data;
    this.multipleExistingPlans = Array.isArray(this.project.existingLandUsePlans);
    this.overlappingDistrictsListString = this.stringifyOverlappingDistricts(this.project.overlappingRegionalDistricts);
    this.commentPeriod = this.project.commentPeriodForBanner;
    this.route.data.subscribe((res: any) => {
      if (Array.isArray(this.project?.shapefiles) && this.project?.shapefiles.length > 0) {
        return;
      }

      if (Array.isArray(res?.documents)) {
				res.documents.forEach(document => {
					if (document?.data?.meta?.length > 0) {
						this.shapefiles.push(...document.data.searchResults);
					}
				})
      }
    });

    // The following items are loaded by a file that is only present on cluster builds.
    // Locally, this will be empty and local defaults will be used.
    const remoteApiPath = window.localStorage.getItem('from_public_server--remote_api_base_path');
    this.pathAPI = (_.isEmpty(remoteApiPath)) ? 'http://localhost:3000/api' : remoteApiPath;
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
		const Esri_BC_Basemap = vectorBasemapLayer("bbe05270d3a642f5b62203d6c454f457", {
			token: "AAPK22185e2b89234d44a13e17d56be107baT24tgFM0N7tI5fRSqvi4IP3_MF167rsx01IUHtYBqmQhNgw9LCDxmRtT2F3rQdqh",
		});
    const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
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

		this.map = L.map(this.mapContainer.nativeElement, {
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
			'BC Basemap': Esri_BC_Basemap,
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

    // Add "map loaded" listener for removing loading message
    // Extra timeout is needed to give vector tiles time to render
    // Base the timeout delay on user connection speed
    this.map.once('moveend', () => {
      this.utils.getConnectionTier().then((tier) => {
        // Convert the returned connection speed to a millisecond delay value
        const delay = { slow: 3500, medium: 3000, fast: 2500, turbo: 2000 }[tier];
        // Set a timeout for removing the loading screen using the calculated value
        setTimeout(() => this.loading = false, delay);
      });
    });

    // save any future base layer changes
    this.map.on('baselayerchange', function (e: L.LayersControlEvent) {
      this.configService.baseLayerName = e.name;
    }, this);

    // Disable mouse zoom on project details - iterferes with scrolling page.
    this.map.scrollWheelZoom.disable();

    let shapefilesToDraw = [];
    if (Array.isArray(this.project.shapefiles) && this.project.shapefiles.length > 0) {
      // Draw project-level shape files if they're available.
      shapefilesToDraw = _.orderBy(this.project.shapefiles, ['order'], ['desc']);
    } else if (this.shapefiles.length > 0) {
      // Otherwise, draw the first shape file that was retrieved by the document resolver, if it exists.
      shapefilesToDraw = [this.shapefiles[0]];
    }

		// Convert documents to shapefiles
    if (Array.isArray(shapefilesToDraw) && shapefilesToDraw.length > 0) {
      this.convertedShapefiles = shapefilesToDraw.map((sf: ProjectShapefile & Document) => {
        if (sf?.documentFileName?.length > 0 && (sf?._id || sf?.document)) {
          const shapefileColour = sf.colour || this.project.shapeFileColour || Constants.style.DEFAULT_SHAPEFILE_COLOUR;
          const fileId = sf?._id || sf?.document;
          const escapedName = this.utils.encodeFileName(sf.documentFileName);
          const shapeurl = this.pathAPI + '/document/' + fileId + '/fetch/' + escapedName;
          const shapefile = new L.Shapefile(shapeurl, {
            isArrayBuffer: false,
            style: {
              color: shapefileColour
            }
          });
          shapefile._sourceUrl = shapeurl;
          return shapefile;
        };
        return null; // return something if invalid
      })
      .filter(sf => sf !== null); // Remove any empty results
    }

		// If there are converted shapefiles
		if (Array.isArray(this.convertedShapefiles) && this.convertedShapefiles.length > 0) {

      const totalShapefiles = this.convertedShapefiles.length;
      let locationAdded = false;
      let analyzedShapefiles = 0;

			this.convertedShapefiles?.forEach((sf) => {

        // Shapefile successfully loaded
				sf.on('data:loaded', () => {
					const keys = Object.keys(sf._layers);
					keys?.forEach(key => {
						if (sf._layers[key]?._bounds) {
							this.calculateShapefileBounds(sf._layers[key]._bounds);
						}
					});
					sf.addTo(this.appFG);
          analyzedShapefiles++;

          // Update our counter and flag if the shapefile has successfully been added
          if (this.appFG.hasLayer(sf)) {
            locationAdded = true;
          }

					// Last iteration only
					if (analyzedShapefiles === totalShapefiles) {
            this.shapeFilesLoadedHook(locationAdded);
					}
				});

        // Shapefile failed to load
        sf.on('data:error', (e) => {
          console.error("Shapefile failed to load:", {
            url: sf._sourceUrl || '',
            error: e
          });
          analyzedShapefiles++;

          // Last iteration only
					if (analyzedShapefiles === totalShapefiles) {
            this.shapeFilesLoadedHook(locationAdded);
					}
        });
			});
		} else {
			// Otherwise skip the shapefiles and just add a marker
			this.addMarkerAndAdjustBounds();
		}
	}

  /**
   * The actions that should be run after all shape files are analyzed.
   * 
   * @param locationAdded A boolean that indicates whether or not at least one shapefile has been added to the map
   */
  private shapeFilesLoadedHook = (locationAdded: boolean) => {
    // Change map bounds based on values in bounds property
    if (this.bounds.southWest.lat && this.bounds.southWest.lng && this.bounds.northEast.lat && this.bounds.northEast.lng) {
      this.map.fitBounds([[this.bounds.southWest.lat, this.bounds.southWest.lng], [this.bounds.northEast.lat, this.bounds.northEast.lng]], {padding: [50, 50]});
    }

    // If no shape files have been added to the map, add a marker
    if (!locationAdded) {
      this.addMarkerAndAdjustBounds();
    } else {
      // Otherwise add the layer to the feature group
      this.map.addLayer(this.appFG);
    }
  }

  /**
   * Adds a marker and centres the bounds of the map around the marker.
   * 
   * @returns {void}
   */
  private addMarkerAndAdjustBounds = () => {
    if (this.project) {
      this.addMarker();
      this.map.addLayer(this.appFG);
      if (this.project.centroid?.length === 2) {
        const [lon, lat] = this.project.centroid.map(Number);
        this.map.fitBounds([[lat - 0.3, lon - 0.3], [lat + 0.3, lon + 0.3]]);
      } else {
        this.map.fitBounds(this.defaultBounds);
      }
		}
  }

	/**
	 * Takes the bounds of a shapefile and updates the overall map bounds to include them.
	 * Bounds can not exceed default BC bounds.
	 * Bounds will not reduce in size, only expand if there are shapefiles that are outside current bounds.
	 * 
	 * @param {LatLngBounds} shapefileBounds
	 * @returns {void}
	 */
	private calculateShapefileBounds = (shapefileBounds) => {
		this.bounds = {
			southWest: {
				lat: shapefileBounds?._southWest.lat >= this.defaultBoundsObject.southWest.lat 
					&& (!this.bounds.southWest.lat || shapefileBounds?._southWest.lat <= this.bounds.southWest.lat) 
					? shapefileBounds._southWest.lat 
					: this.bounds.southWest.lat,
				lng: shapefileBounds?._southWest.lng >= this.defaultBoundsObject.southWest.lng 
					&& (!this.bounds.southWest.lng || shapefileBounds?._southWest.lng <=  this.bounds.southWest.lng) 
					? shapefileBounds._southWest.lng 
					: this.bounds.southWest.lng,
			},
			northEast: {
				lat: shapefileBounds?._northEast.lat <= this.defaultBoundsObject.northEast.lat 
					&& (!this.bounds.northEast.lat || shapefileBounds?._northEast.lat >= this.bounds.northEast.lat) 
					? shapefileBounds._northEast.lat 
					: this.bounds.northEast.lat,
				lng: shapefileBounds?._northEast.lng <= this.defaultBoundsObject.northEast.lng 
					&& (!this.bounds.northEast.lng || shapefileBounds?._northEast.lng >= this.bounds.northEast.lng) 
					? shapefileBounds._northEast.lng 
					: this.bounds.northEast.lng,
			}
		};
	}

	/**
   * Adds a marker to the map.
   *
   * @returns {void}
   */
	private addMarker = () => {
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
		this.appFG.addLayer(marker);
	}

  /**
   * To avoid timing conflict with animations (resulting in small map tile at top left of page),
   * ensure map component is visible in the DOM then update it; otherwise wait a bit...
   *
   * @see https://github.com/Leaflet/Leaflet/issues/4835
   * @see https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
   * @returns {undefined}
   */
  private fixMap() {
    if (this.elementRef.nativeElement.offsetParent) {
      this.fitBounds(this.appFG.getBounds());
    } else {
      setTimeout(this.fixMap.bind(this), 50);
    }
  }

  /**
   * Return string of overlapping districts.
   *
   * @param {string|array} districts
   * @returns {string}
   */
  stringifyOverlappingDistricts(districts: string | string[]): string {
    let overlappingDistrictsListString: string;
    if (Array.isArray(districts) === true ) {
      overlappingDistrictsListString = (<string[]>districts).join(', ');
    } else {
      overlappingDistrictsListString = districts as string;
    }
    return overlappingDistrictsListString;
  }

  /**
   * Fits bounds of leaflet map.
   *
   * @param {L.LatLngBounds|null} bounds
   * @returns {undefined}
   */
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
    if (this.map) { this.map.remove(); this.map = undefined; }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
