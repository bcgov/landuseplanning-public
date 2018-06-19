import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as L from 'leaflet';

import { Application } from 'app/models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { SearchService } from 'app/services/search.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit, OnDestroy {
  readonly tabLinks = [
    { label: 'Application', link: 'application' },
    { label: 'Commenting', link: 'commenting' },
    { label: 'Decisions', link: 'decisions' }
  ];

  public application: Application = null;
  public map: L.Map = null;
  public appFG = L.featureGroup(); // group of layers for subject app
  private fitBoundsOptions: L.FitBoundsOptions = {
    // maxZoom: 17, // TODO: unclear why this is needed
    // disable animation to prevent known bug where zoom is sometimes incorrect
    // ref: https://github.com/Leaflet/Leaflet/issues/3249
    // animate: false, // TODO: seems to work correctly currently
    // use bottom padding to keep shape in bounds
    paddingBottomRight: [0, 25]
  };
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private searchService: SearchService,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // used in template
  ) { }

  ngOnInit() {
    const self = this;

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            self.application = data.application;

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
                  // fit the bounds for this app
                  const bounds = self.appFG.getBounds();
                  if (bounds && bounds.isValid()) {
                    self.map.fitBounds(bounds, self.fitBoundsOptions);
                  }
                };

                // prevent underlying map actions for these events
                L.DomEvent.disableClickPropagation(element); // includes double-click
                L.DomEvent.disableScrollPropagation(element);

                return element;
              },
            });

            this.searchService.getByDTID(this.application.tantalisID, true)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                features => {
                  const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                    maxZoom: 13
                  });
                  const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
                    maxZoom: 16
                  });
                  const OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 20
                  });
                  const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                    maxZoom: 16
                  });
                  const World_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                    maxZoom: 17
                  });

                  self.map = L.map('map', {
                    layers: [World_Imagery],
                    zoomControl: false
                  });

                  // NB: don't need to handle map change events
                  // since we always leave the subject app visible

                  // add reset view control
                  self.map.addControl(new resetViewControl());

                  // add zoom control
                  L.control.zoom({ position: 'topleft' }).addTo(self.map);

                  // add base maps layers control
                  const baseMaps = {
                    'Ocean Base': Esri_OceanBasemap,
                    'Nat Geo World Map': Esri_NatGeoWorldMap,
                    'Open Surfer Roads': OpenMapSurfer_Roads,
                    'World Topographic': World_Topo_Map,
                    'World Imagery': World_Imagery
                  };
                  L.control.layers(baseMaps).addTo(self.map);

                  // add scale control
                  L.control.scale({ position: 'bottomright' }).addTo(self.map);

                  // remove and clear all app layers
                  self.appFG.removeFrom(self.map);
                  self.appFG.clearLayers();

                  // draw features for this app
                  const appFG = L.featureGroup(); // layers for current app
                  features.forEach(f => {
                    const feature = JSON.parse(JSON.stringify(f));
                    // needs to be valid GeoJSON
                    delete feature.geometry_name;
                    const featureObj: GeoJSON.Feature<any> = feature;
                    const layer = L.geoJSON(featureObj, {});
                    layer.addTo(appFG);
                  });
                  self.appFG = appFG; // save it
                  appFG.addTo(self.map); // add to map

                  // fit the bounds
                  const bounds = self.appFG.getBounds();
                  if (bounds && bounds.isValid()) {
                    self.map.fitBounds(bounds, self.fitBoundsOptions);
                  }
                },
                error => {
                  console.log('error =', error);
                });
          } else {
            // application not found --> navigate back to application list
            alert('Uh-oh, couldn\'t load application');
            this.router.navigate(['/applications']);
          }
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private gotoMap() {
    // pass along the id of the current application if available
    // so that the map component can show the popup for it
    const applicationId = this.application ? this.application._id : null;
    this.router.navigate(['/map', { application: applicationId }]);
  }

  private addComment() {
    if (this.application.currentPeriod) {
      // open modal
      const modal = this.modalService.open(AddCommentComponent, { backdrop: 'static', size: 'lg' });
      // set input parameter
      (<AddCommentComponent>modal.componentInstance).currentPeriod = this.application.currentPeriod;
      // check result
      modal.result.then((result) => {
        // saved
        console.log(`Success, result = ${result}`);
      }, (reason) => {
        // canceled
        console.log(`Error, reason = ${reason}`); // see ModalDismissReasons
      });
    }
  }
}
