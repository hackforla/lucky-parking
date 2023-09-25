import { GeoJSON } from "geojson";

export interface FeatureResult extends GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
  place_name: string;
  place_type: string[];
  text: string;
}
