import { Feature, FeatureCollection, Point } from "geojson";
import { z } from "zod";
import { FeatureSchema, FeatureCollectionSchema } from "@/lib/geojson/geojson.schema";

/* ——————————————— Schemas ——————————————— */

export const ParkingCitationPropertiesSchema = z.object({
	ticket_number: z.string(),
	issue_date: z.string(), // ISO-like datetime string
	issue_time: z.string(), // HHMM as string (e.g. "846")
	meter_id: z.string().nullable(),
	marked_time: z.string(),
	rp_state_plate: z.string(),
	plate_expiry_date: z.string(), // YYYYMM
	vin: z.string().nullable(),
	make: z.string(),
	body_style: z.string(),
	color: z.string(),
	location: z.string(),
	route: z.string().nullable(),
	agency: z.string(),
	violation_code: z.string(),
	violation_description: z.string(),
	fine_amount: z.string(),
	agency_desc: z.string(),
	color_desc: z.string(),
	body_style_desc: z.string(),
	loc_lat: z.string(),
	loc_long: z.string(),
});

export const ParkingCitationFeatureSchema = FeatureSchema(ParkingCitationPropertiesSchema);

export const ParkingCitationFeatureCollectionSchema = FeatureCollectionSchema(ParkingCitationFeatureSchema);

/* ——————————————— Types ——————————————— */

export type ParkingCitationProperties = z.infer<typeof ParkingCitationPropertiesSchema>;

export type ParkingCitationFeature = Feature<Point, ParkingCitationProperties>;

export type ParkingCitationFeatureCollection = FeatureCollection<Point, ParkingCitationProperties>;
