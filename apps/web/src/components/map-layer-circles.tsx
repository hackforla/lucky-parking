import type { CircleLayerSpecification } from "mapbox-gl";
import { Layer } from "react-map-gl/mapbox";

export const MAP_LAYER_CIRCLES_ID = "citations-circles";

export const circles: Omit<CircleLayerSpecification, "source"> = {
	id: MAP_LAYER_CIRCLES_ID,
	type: "circle",
	minzoom: 13, // ⬅️ push appearance later
	paint: {
		"circle-color": "rgba(239,138,98,0.95)",
		"circle-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 15, 1],
		"circle-radius": ["interpolate", ["linear"], ["zoom"], 13, 3, 18, 7],
		"circle-stroke-color": "rgba(255,255,255,0.9)",
		"circle-stroke-width": 1.25,
	},
};

export const MapLayerCircles = (props: Partial<Omit<CircleLayerSpecification, "id">>) => {
	return (
		<Layer
			{...circles}
			{...props}
		/>
	);
};
