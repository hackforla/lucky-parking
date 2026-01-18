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

/**
 * Properties for a parking citation feature
 */
export type ParkingCitationProperties = {
	ticket_number: string;
	issue_date: string; // ISO-like datetime string
	issue_time: string; // HHMM as string (e.g. "846")
	meter_id: string | null;
	marked_time: string;
	rp_state_plate: string;
	plate_expiry_date: string; // YYYYMM
	vin: string | null;
	make: string;
	body_style: string;
	color: string;
	location: string;
	route: string | null;
	agency: string;
	violation_code: string;
	violation_description: string;
	fine_amount: string; // stored as string in source data
	agency_desc: string;
	color_desc: string;
	body_style_desc: string;
	loc_lat: string;
	loc_long: string;
};

/**
 * A single parking citation feature
 */
export type ParkingCitationFeature = Feature<Point, ParkingCitationProperties>;

/**
 * Collection of parking citation features
 */
export type ParkingCitationFeatureCollection = FeatureCollection<Point, ParkingCitationProperties>;

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
