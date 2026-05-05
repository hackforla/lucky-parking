import neighborhoodCouncilCollection from "data/los-angeles-neighborhood-councils.json";
import { BBox, Feature, FeatureCollection, Point, Polygon } from "geojson";
import "mapbox-gl";
import { RefObject } from "react";

/**
 * A React ref
 */
export type AnyRef<T> = RefObject<T | null>;

/**
 * Make all properties in T non-nullable
 */
export type NonNullableProperties<T> = { [P in keyof T]: NonNullable<T[P]> };

export type NeighborhoodCouncilProperties = (typeof neighborhoodCouncilCollection)["features"][0]["properties"];

export type NeighborhoodCouncilFeature = Feature<Polygon, NeighborhoodCouncilProperties>;

export type NeighborhoodCouncilFeatureCollection = FeatureCollection<Polygon, NeighborhoodCouncilProperties>;

export type GeocoderNeighborhoodCouncilProperties = NeighborhoodCouncilProperties & {
	feature_type: string;
	name: string;
	name_preferred: string;
	place_formatted: string;
	full_address: string;
	bbox: BBox;
	center: Feature<Point>;
};

export type GeocoderNeighborhoodCouncilFeature = NeighborhoodCouncilFeature & {
	id: string;
	properties: GeocoderNeighborhoodCouncilProperties;
};

export type GeocoderResult = {
	id: string;
	properties: {
		feature_type: string;
		name: string;
		name_preferred: string;
		place_formatted: string;
		full_address: string;
		bbox: BBox;
		center: Feature<Point>;
	};
};
