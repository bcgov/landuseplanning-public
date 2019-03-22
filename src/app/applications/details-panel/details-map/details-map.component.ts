import { Component, AfterViewInit, OnDestroy, Input, ElementRef } from '@angular/core';
import * as L from 'leaflet';

import { Application } from 'app/models/application';

@Component({
  selector: 'app-details-map',
  templateUrl: './details-map.component.html',
  styleUrls: ['./details-map.component.scss']
})
export class DetailsMapComponent implements AfterViewInit, OnDestroy {
  @Input() application: Application = null;

  public map: L.Map;
  public appFG = L.featureGroup(); // group of layers for subject app

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    // custom control to reset map view
    const resetViewControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: () => {
        const element = L.DomUtil.create('button');

        element.title = 'Reset view';
        element.innerText = 'refresh'; // material icon name
        element.onclick = () => this.fitBounds();
        element.className = 'material-icons map-reset-control';

        // prevent underlying map actions for these events
        L.DomEvent.disableClickPropagation(element); // includes double-click
        L.DomEvent.disableScrollPropagation(element);

        return element;
      }
    });

    const World_Imagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 16.4,
        noWrap: true
      }
    );

    this.map = L.map('map', {
      layers: [World_Imagery],
      zoomControl: false, // will be added manually below
      attributionControl: false, // assume not needed in thumbnail
      scrollWheelZoom: false, // not desired in thumbnail
      doubleClickZoom: false, // not desired in thumbnail
      zoomSnap: 0.1, // for greater granularity when fitting bounds
      zoomDelta: 3, // for faster zooming in thumbnail
      maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)) // restrict view to "the world"
    });

    // add scale control
    L.control.scale({ position: 'bottomleft' }).addTo(this.map);

    // add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // add reset view control
    this.map.addControl(new resetViewControl());
    // draw application features
    if (this.application) {
      // safety check
      this.application.features.forEach(f => {
        const feature = JSON.parse(JSON.stringify(f));
        // needs to be valid GeoJSON
        delete feature.geometry_name;
        const featureObj: GeoJSON.Feature<any> = feature;
        const layer = L.geoJSON(featureObj);
        this.appFG.addLayer(layer);

        this.map.on('zoomend', () => {
          const weight = this.getWeight(feature.properties.TENURE_AREA_IN_HECTARES, this.map.getZoom());
          layer.setStyle({ weight });
        });
      });
      this.map.addLayer(this.appFG);
    }

    this.fixMap();
  }

  // to avoid timing conflict with animations (resulting in small map tile at top left of page),
  // ensure map component is visible in the DOM then update it; otherwise wait a bit and try again
  // ref: https://github.com/Leaflet/Leaflet/issues/4835
  // ref: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  private fixMap() {
    if (this.elementRef.nativeElement.offsetParent) {
      this.fitBounds();
    } else {
      setTimeout(this.fixMap.bind(this), 50);
    }
  }

  private fitBounds() {
    const bounds = this.appFG.getBounds();
    if (bounds && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }

  /**
   * Given a features size in hectares and the maps zoom level, returns the weight to use when rendering the shape.
   * Increasing the weight is used to allow features to remain visible on the map when zoomed out far.
   *
   * @private
   * @param {number} size size of the feature, in hectares.
   * @param {number} zoom zoom level of the map.
   * @returns {number} a positive non-null weight for the layer to use when rendering the shape (default: 3)
   * @memberof DetailsMapComponent
   */
  private getWeight(size: number, zoom: number): number {
    if (!size || !zoom) {
      return 3; // default
    }

    if (size < 2) {
      if (zoom < 3) {
        return 6;
      }
      if (zoom < 10) {
        return 7;
      }
      if (zoom < 14) {
        return 6;
      }
    }

    if (size < 15) {
      if (zoom < 12) {
        return 6;
      }
    }

    if (size < 30) {
      if (zoom < 9) {
        return 6;
      }
    }

    if (size < 60) {
      if (zoom < 12) {
        return 5;
      }
    }

    if (size < 150) {
      if (zoom < 9) {
        return 6;
      }
    }

    if (size < 1000) {
      if (zoom < 6) {
        return 6;
      }
    }

    if (zoom < 5) {
      return 5;
    }

    return 3; // default
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
