import type { FeatureCollection } from "geojson";
import { PropsWithChildren } from "react";
import { Source } from "react-map-gl/mapbox";
import { useCitations } from "@/hooks/use-citations";

const EMPTY_CITATIONS: FeatureCollection = { type: "FeatureCollection", features: [] };

export const MapSourceCitations = ({ children }: PropsWithChildren) => {
	const { data } = useCitations();

	// Mapbox rejects undefined `data` with "not a valid GeoJSON object".
	// Pass only the FeatureCollection fields — `meta` is for the UI, not the source.
	const geojson: FeatureCollection = data ? { type: "FeatureCollection", features: data.features } : EMPTY_CITATIONS;

	return (
		<Source
			id="citations"
			type="geojson"
			data={geojson}>
			{children}
		</Source>
	);
};
