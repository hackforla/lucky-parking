import { z } from "zod";
import { FeatureCollectionSchema, FeatureSchema } from "@/lib/geojson/geojson.schema";

const position = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const polygon = z.array(z.array(position).min(4).max(50_000)).min(1);

export const SelectionGeometrySchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("Point"), coordinates: position }),
	z.object({ type: z.literal("Polygon"), coordinates: polygon }),
	z.object({ type: z.literal("MultiPolygon"), coordinates: z.array(polygon).min(1) }),
]);

export const CitationsRequestSchema = z.object({
	date_min: z.iso.date(),
	date_max: z.iso.date(),
	geometries: z.array(SelectionGeometrySchema).min(1).max(2),
	radius_meters: z.number().positive().max(50_000).default(500),
	limit: z.number().int().min(1).max(10_000).default(1000),
	offset: z.number().int().min(0).max(1_000_000).default(0),
});

export const CitationFeatureSchema = FeatureSchema(
	z.object({
		ticket_number: z.string(),
		issue_datetime: z.string(),
		violation_code: z.string().nullable(),
		violation_description: z.string().nullable(),
		fine_amount: z.number().nullable(),
	})
);

export const CitationsResultSchema = FeatureCollectionSchema(CitationFeatureSchema).extend({
	meta: z.object({
		total: z.number().int().nonnegative(),
		total_fine: z.number(),
		average_fine: z.number(),
		returned: z.number().int().nonnegative(),
		limit: z.number().int().positive(),
		offset: z.number().int().nonnegative(),
		truncated: z.boolean(),
		next_offset: z.number().int().nonnegative().nullable(),
		radius_meters: z.number().positive(),
	}),
});

export type CitationFeature = z.infer<typeof CitationFeatureSchema>;
export type CitationsResult = z.infer<typeof CitationsResultSchema>;
