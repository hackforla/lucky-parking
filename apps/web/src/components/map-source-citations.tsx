import { useCitations } from "hooks/use-citations";
import { PropsWithChildren } from "react";
import { Source } from "react-map-gl/mapbox";

export const MapSourceCitations = ({ children }: PropsWithChildren) => {
	const { data } = useCitations();

	return (
		<Source
			id="citations"
			type="geojson"
			data={data}>
			{children}
		</Source>
	);
};
