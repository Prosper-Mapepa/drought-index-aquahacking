declare module "esri-leaflet" {
  import * as L from "leaflet";

  export function imageMapLayer(options: {
    url: string;
    opacity?: number;
    attribution?: string;
  }): L.Layer;

  export function featureLayer(options: {
    url: string;
    style?: (feature?: GeoJSON.Feature) => L.PathOptions;
    opacity?: number;
    onEachFeature?: (feature: GeoJSON.Feature, layer: L.Layer) => void;
  }): L.Layer;

  export function dynamicMapLayer(options: {
    url: string;
    layers?: number[];
    opacity?: number;
  }): L.Layer;
}
