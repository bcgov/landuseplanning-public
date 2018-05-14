import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { DialogService } from 'ng2-bootstrap-modal';

import { Application } from '../../models/application';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { SearchService } from '../../services/search.service';
import * as L from 'leaflet';
import * as _ from 'lodash';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit, OnDestroy {
  readonly tabLinks = [
    { label: 'Application', link: 'application' },
    { label: 'Commenting', link: 'commenting' },
    { label: 'Decisions', link: 'decisions' }
  ];
  public layers: L.Layer[];
  public fg: L.FeatureGroup;
  public map: L.Map;
  private baseMaps: {};
  private control: L.Control;
  private maxZoom = { maxZoom: 17 };

  public application: Application = null;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private searchService: SearchService,
    private applicationService: ApplicationService, // used in template
    private commentPeriodService: CommentPeriodService // used in template
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { application: Application }) => {
          if (data.application) {
            this.application = data.application;
            const self = this;
            // NB: always reload results to reduce chance of race condition
            //     with drawing map and features
            this.searchService.getByDTID(this.application.tantalisID, true)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                features => {
                  const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                  });
                  const World_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  });
                  const OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  });
                  const Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                    maxZoom: 13
                  });
                  const Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
                    maxZoom: 16
                  });
                  self.map = L.map('map', {
                    layers: [World_Imagery]
                  });

                  // set up the controls
                  self.baseMaps = {
                    'Ocean Base': Esri_OceanBasemap,
                    'Nat Geo World Map': Esri_NatGeoWorldMap,
                    'Open Surfer Roads': OpenMapSurfer_Roads,
                    'World Topographic': World_Topo_Map,
                    'World Imagery': World_Imagery
                  };
                  self.control = L.control.layers(self.baseMaps, null, { collapsed: true }).addTo(self.map);

                  if (self.fg) {
                    _.each(self.layers, function (layer) {
                      self.map.removeLayer(layer);
                    });
                    self.fg.clearLayers();
                  } else {
                    self.fg = L.featureGroup();
                  }

                  _.each(features, function (feature) {
                    const f = JSON.parse(JSON.stringify(feature));
                    // Needed to be valid GeoJSON
                    delete f.geometry_name;
                    const featureObj: GeoJSON.Feature<any> = f;
                    const layer = L.geoJSON(featureObj);
                    const options = { maxWidth: 400 };
                    self.fg.addLayer(layer);
                    layer.addTo(self.map);
                  });

                  const bounds = self.fg.getBounds();
                  if (!_.isEmpty(bounds)) {
                    self.map.fitBounds(bounds, self.maxZoom);
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
      this.dialogService.addDialog(AddCommentComponent,
        {
          currentPeriod: this.application.currentPeriod
        }, {
          // index: 0,
          // autoCloseTimeout: 10000,
          // closeByClickingOutside: true,
          backdropColor: 'rgba(0, 0, 0, 0.5)'
        })
        .takeUntil(this.ngUnsubscribe)
        .subscribe((isConfirmed) => {
          // // we get dialog result
          // if (isConfirmed) {
          //   // TODO: reload page?
          //   console.log('saved');
          // } else {
          //   console.log('canceled');
          // }
        });
    }
  }
}
