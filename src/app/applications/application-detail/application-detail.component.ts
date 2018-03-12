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
    { label: 'Comments', link: 'comments' },
    { label: 'Decisions', link: 'decisions' }
  ];
  public layers: L.Layer[];
  public fg: L.FeatureGroup;
  public map: L.Map;

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
            this.searchService.getByDTID(this.application.tantalisID.toString()).subscribe(
              features => {
                self.map = L.map('map').setView([53.505, -127.09], 6);
                console.log('map');
                const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                  attribution: 'Tiles &copy; Esri &mdash; and the GIS User Community'
                }).addTo(self.map);

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
                  // const content = '<h3>' + featureObj.properties.TENURE_TYPE
                  //   + '<br />'
                  //   + featureObj.properties.TENURE_SUBTYPE + '</h3>'
                  //   + '<strong>ShapeID: </strong>' + featureObj.properties.INTRID_SID
                  //   + '<br />'
                  //   + '<strong>Disposition: </strong>' + featureObj.properties.DISPOSITION_TRANSACTION_SID
                  //   + '<br />'
                  //   + '<strong>Purpose: </strong>' + featureObj.properties.TENURE_PURPOSE
                  //   + '<br />'
                  //   + '<strong>Sub Purpose: </strong>' + featureObj.properties.TENURE_SUBPURPOSE
                  //   + '<br />'
                  //   + '<strong>Stage: </strong>' + featureObj.properties.TENURE_STAGE
                  //   + '<br />'
                  //   + '<strong>Status: </strong>' + featureObj.properties.TENURE_STATUS
                  //   + '<br />'
                  //   + '<strong>Hectares: </strong>' + featureObj.properties.TENURE_AREA_IN_HECTARES
                  //   + '<br />'
                  //   + '<br />'
                  //   + '<strong>Legal Description: </strong>' + featureObj.properties.TENURE_LEGAL_DESCRIPTION;
                  // const popup = L.popup(options).setContent(content);
                  // layer.bindPopup(popup);
                  self.fg.addLayer(layer);
                  layer.addTo(self.map);
                });

                const bounds = self.fg.getBounds();
                if (!_.isEmpty(bounds)) {
                  self.map.fitBounds(bounds);
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
        },
        error => {
          console.log(error);
          alert('Uh-oh, couldn\'t load application');
          this.router.navigate(['/applications']);
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
