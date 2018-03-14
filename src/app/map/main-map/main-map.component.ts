import { Component, Inject, Input, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Application } from 'app/models/application';
import { SearchService } from '../../services/search.service';
import * as L from 'leaflet';
import * as _ from 'lodash';

declare module 'leaflet' {
  export interface FeatureGroup<P = any> {
    dispositionId: number;
  }
}

@Component({
  selector: 'app-main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss'],
  providers: [
  ]
})
export class MainMapComponent implements OnInit {
  // public properties
  @Input() animate = true;

  // private fields
  private selectedId: string;
  private map: L.Map;
  public layers: L.Layer[];
  private featureGroups: L.FeatureGroup[];
  public fg: L.FeatureGroup;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.featureGroups = [];
  }

  showMaps(apps) {
    const self = this;
    const includeDisps = [];
    _.each(apps, function(a) {
      // Build array of included disps.
      includeDisps.push(a.tantalisID);
    });
    const currentFG = L.featureGroup();
    // Go through each layer turning on/off the layer.
    _.each(this.featureGroups, function (fg) {
      // Check each layergroup to see if it should be removed or not.
      const found = _.find(includeDisps, function (i) {
        return fg.dispositionId === i;
      });
      if (!found) {
        // Remove it.
        fg.eachLayer(function (l) {
          self.map.removeLayer(l);
        });
      } else {
        // Make sure it's added back in.
        fg.eachLayer(function (l) {
          self.map.addLayer(l);
          l.addTo(currentFG);
        });
      }

      // Update the bounds accordingly.
      const b = currentFG.getBounds();
      if (!_.isEmpty(b)) {
        self.map.fitBounds(b);
      }
    });
  }

  drawMap(apps: Application[]) {
    const self = this;
    let globalBounds = null;

    this.map = L.map('map').setView([53.505, -127.09], 4);

    const World_Topo_Map = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; and the GIS User Community'
    }).addTo(this.map);

    if (self.fg) {
      _.each(self.layers, function (layer) {
        self.map.removeLayer(layer);
      });
      self.fg.clearLayers();
    } else {
      self.fg = L.featureGroup();
    }

    _.each(apps, function (app) {
      self.searchService.getByDTID(app.tantalisID.toString()).subscribe(
        features => {
          const group = L.featureGroup();
          _.each(features, function (feature) {
            const f = JSON.parse(JSON.stringify(feature));
            // Needed to be valid GeoJSON
            delete f.geometry_name;
            const featureObj: GeoJSON.Feature<any> = f;
            const layer = L.geoJSON(featureObj);
            const options = { maxWidth: 400 };
            const content = '<h3>' + featureObj.properties.TENURE_TYPE
              + '<br />'
              + featureObj.properties.TENURE_SUBTYPE + '</h3>'
              + '<strong>ShapeID: </strong>' + featureObj.properties.INTRID_SID
              + '<br />'
              + '<strong>Disposition: </strong>' + featureObj.properties.DISPOSITION_TRANSACTION_SID
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
            const popup = L.popup(options).setContent(content);
            layer.bindPopup(popup);
            self.fg.addLayer(layer);
            layer.addTo(group);
          });
          const b = group.getBounds();
          if (!_.isEmpty(b)) {
            // Add marker to fg.
            if (!globalBounds) {
              globalBounds = group.getBounds();
            } else {
              globalBounds.extend(b);
            }
            self.map.fitBounds(globalBounds);
          }
          group.dispositionId = app.tantalisID;
          group.addTo(self.map);
          self.featureGroups.push(group);
        },
        error => {
          console.log('error', error);
        }
      );
    });
  }

  highlightApplication(app: Application, show: boolean) {
    const self = this;
    const currentFG = L.featureGroup();
    // Go through each layer turning on/off the layer.
    _.each(this.featureGroups, function (fg) {
      // Check each layergroup to see if it should be removed or not.
      fg.eachLayer(function (l) {
        self.map.removeLayer(l);
      });

      if (show) {
        if (fg.dispositionId === app.tantalisID) {
          // Highlight it
          fg.eachLayer(function (l) {
            self.map.addLayer(l);
            l.addTo(currentFG);
          });
        }
      } else {
        fg.eachLayer(function (l) {
          currentFG.addTo(self.map.addLayer(l));
          l.addTo(currentFG);
        });
      }
    });
    const b = currentFG.getBounds();
    if (!_.isEmpty(b)) {
      self.map.fitBounds(b);
    }
  }
}
