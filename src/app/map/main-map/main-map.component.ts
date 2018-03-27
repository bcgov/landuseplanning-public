import { Component, Inject, Input, Output, HostBinding, OnInit, EventEmitter } from '@angular/core';
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
  @Output() visibleLayer = new EventEmitter<any>();

  // private fields
  private selectedId: string;
  private map: L.Map;
  public layers: L.Layer[];
  private featureGroups: L.FeatureGroup[];
  public fg: L.FeatureGroup;
  private baseMaps: {};
  private control: L.Control;
  private maxZoom = { maxZoom: 17 };
  private isUser = false;
  private markers = [];
  private cachedMaps = [];

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    var resetViewControl = L.Control.extend({
      options: {
      position: 'topleft'
      },
      onAdd: function (map) {
        var container = L.DomUtil.create('i', 'material-icons leaflet-bar leaflet-control leaflet-control-custom');

        container.style.backgroundColor = 'white';
        container.title = 'Reset Map';
        container.innerText = 'refresh';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';

        container.onclick = function(){
          _.each(self.featureGroups, function (fg) {
            self.visibleLayer.next({tantalisID: fg.dispositionId, isVisible: true});
          });
          self.showMaps(self.cachedMaps);
        }
        return container;
      },
    });

    this.featureGroups = [];

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
    this.map = L.map('map', {
      layers: [World_Imagery]
    });

    // Bounding box view?
    var self = this;
    this.map.on('dragend', function () {
      if (self.isUser) {
        self.isUser = false;
        self.resetVisible();
      }
    });
    this.map.on('zoomend', function() {
      if (self.isUser) {
        self.isUser = false;
        self.resetVisible();
      }
    });
    this.map.on('moveend', function() {
      if (self.isUser) {
        self.isUser = false;
        self.resetVisible();
      }
    });
    this.map.on('movestart', function() {
      self.isUser = true;
    });
    this.map.on('dragstart', function() {
      self.isUser = true;
    });
    this.map.on('drag', function() {
      self.isUser = true;
    });

    // Setup the controls
    this.baseMaps = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'Open Surfer Roads': OpenMapSurfer_Roads,
      'World Topographic': World_Topo_Map,
      'World Imagery': World_Imagery
    };
    this.control = L.control.layers(this.baseMaps, null, { collapsed: false }).addTo(this.map);

    this.map.addControl(new resetViewControl());
  }

  resetVisible() {
    var self = this;
    var width = self.map.getBounds().getEast() - self.map.getBounds().getWest();
    var height = self.map.getBounds().getNorth() - self.map.getBounds().getSouth();

    const b = self.map.getBounds();
    // Go through each layer turning on/off the layer.
    _.each(self.featureGroups, function (fg) {
      const fgBounds = fg.getBounds();
      if (fgBounds && fgBounds.isValid() && b.intersects(fgBounds)) {
        // Intersects, make sure the list item shows
        self.visibleLayer.next({tantalisID: fg.dispositionId, isVisible: true});
      } else {
        // Doesn't intersect, make it hidden in the left nav.
        self.visibleLayer.next({tantalisID: fg.dispositionId, isVisible: false});
      }
    });
  }

  showMaps(apps) {
    const self = this;
    self.cachedMaps = apps;
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
        self.map.fitBounds(b, self.maxZoom);
      }
    });
  }

  drawMap(apps: Application[]) {
    const self = this;
    self.cachedMaps = apps;
    let globalBounds = null;

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
            self.map.fitBounds(globalBounds, self.maxZoom);
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
      self.map.fitBounds(b, self.maxZoom);
    }
  }
}
