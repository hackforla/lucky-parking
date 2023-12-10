import { Result } from "@mapbox/mapbox-gl-geocoder";
import GeoJSON from "geojson";

type BaseGeocodeResult =
  | GeoJSON.Feature<GeoJSON.Point | GeoJSON.Polygon | GeoJSON.MultiPolygon>
  | Omit<Result, "address" | "center" | "context" | "relevance" | "text">;

export type GeocodeResult = BaseGeocodeResult & {
  address?: string;
  bbox: [number, number, number, number];
  center: GeoJSON.Feature<GeoJSON.Point> | [number, number];
  context?: any[];
  place_name: string;
  place_type: string[];
  relevance?: number;
  text?: string;
};
