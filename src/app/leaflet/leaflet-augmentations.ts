// Leaflet declarations
// Allows you to add additional properties and methods to Leaflet
// Used for typing before script is available in component
import 'leaflet';

declare module 'leaflet' {
  // Marker Cluster
  interface MarkerClusterGroup extends FeatureGroup {
    addLayer(layer: Layer): this;
    clearLayers(): this;
  }
  function markerClusterGroup(options?: any): MarkerClusterGroup;

  // Esri vector basemap
  namespace esri {
    namespace Vector {
      function vectorBasemapLayer(
        basemapId: string,
        options?: any
      ): Layer;
    }
  }

  //  Extend core types
  interface Marker {
    projectId?: string;
    _latlng?: LatLng;
  }

  interface FeatureGroup {
    projectId?: string;
  }

  // Shapefile plugin
  class Shapefile extends GeoJSON {
    shapefileOrder?: number;
    _sourceUrl?: string;
    constructor(baseUrl: string | ArrayBuffer, options?: any);
  }
}
