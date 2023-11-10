import { z } from "zod";

export const DateRangeSchema = z.array(z.string().datetime());

// TODO: Write full schema
export const GeoPolygon = z.any();

export const CitationFiltersSchema = z.object({
  dates: DateRangeSchema,
  geometry: GeoPolygon,
});
