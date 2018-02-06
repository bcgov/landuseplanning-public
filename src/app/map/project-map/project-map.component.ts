import { Component, Inject, Input, OnInit } from '@angular/core';

import { MapConfigService } from '../config/map-config.service';
import { Project } from '../../models/project';

@Component({
  selector: 'app-project-map',
  templateUrl: './project-map.component.html',
  styleUrls: ['./project-map.component.scss'],
  providers: [
    MapConfigService
  ]
})
export class ProjectMapComponent implements OnInit {
  // public properties
  webMapProperties: __esri.WebMapProperties;
  mapViewProperties: __esri.MapViewProperties;
  map: __esri.Map;
  mapView: __esri.MapView;

  @Input() project: Project;
  @Input() zoom = 6;

  constructor(private config: MapConfigService) { }

  ngOnInit() {
    const props = this.config.get();
    const { latitude, longitude } = this.project;  // ES6 destructuring

    this.webMapProperties = props.mainMap.webmap;
    this.mapViewProperties = { ...props.mainMap.mapView, zoom: this.zoom, center: { latitude, longitude } };
  }

  onMapInit(mapInfo: { map: __esri.Map, mapView: __esri.MapView }) {
    const args = {
      ...mapInfo,
      featureLayer: <__esri.FeatureLayer>null
    };

    Promise.resolve(args)
      // store local references to map and view
      .then(obj => {
        this.map = obj.map;
        this.mapView = obj.mapView;
        return obj;
      })
      // find the feature layer with `project` data
      .then(obj => {
        const { map } = obj;  // es6 destructuring
        obj.featureLayer = this.findFeatureLayer(map);
        return obj;
      })
      // filter out all projects except the one we want to show
      .then(obj => {
        const { featureLayer } = obj;  // es6 destructuring
        return this.showSingleProject(featureLayer, this.project.code)
          .then(() => obj);
      });
  }

  private findFeatureLayer(map: __esri.Map): __esri.FeatureLayer {
    // need to cast the layer as FeatureLayer to make TypeScript happy
    return map.layers.find(lyr => lyr.type === 'feature') as __esri.FeatureLayer;
  }

  private showSingleProject(featureLayer: __esri.FeatureLayer, projectId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // set the definition expression directly on layer instance to only display a single project
      return featureLayer.then(
        (fl: __esri.FeatureLayer) => {
          fl.definitionExpression = `code = '${projectId}'`;
        })
        .then(() => resolve())
        .otherwise(reject);
    });
  }
}
