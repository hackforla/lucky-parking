import { z } from "zod";

/* ——————————————— Schemas ——————————————— */

export const PointGeometrySchema = z.object({
	type: z.literal("Point"),
	coordinates: z.tuple([z.number(), z.number()]),
});

export const FeatureSchema = <T extends z.ZodTypeAny>(properties: T) =>
	z.object({
		type: z.literal("Feature"),
		geometry: PointGeometrySchema,
		properties,
	});

export const FeatureCollectionSchema = <T extends z.ZodTypeAny>(featureSchema: T) =>
	z.object({
		type: z.literal("FeatureCollection"),
		features: z.array(featureSchema),
	});
