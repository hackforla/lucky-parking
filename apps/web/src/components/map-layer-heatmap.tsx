import type { HeatmapLayerSpecification } from "mapbox-gl";
import { Layer } from "react-map-gl/mapbox";

export const MAP_LAYER_HEATMAP_ID = "citations-heatmap";

export const heatmap: Omit<HeatmapLayerSpecification, "source"> = {
	id: MAP_LAYER_HEATMAP_ID,
	type: "heatmap",
	paint: {
		"heatmap-color": [
			"interpolate",
			["linear"],
			["heatmap-density"],
			0,
			"rgba(33,102,172,0)",
			0.2,
			"rgb(103,169,207)",
			0.4,
			"rgb(209,229,240)",
			0.6,
			"rgb(253,219,199)",
			0.8,
			"rgb(239,138,98)",
			0.9,
			"rgb(255,201,101)",
		],
		"heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
		"heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 13, 1, 15, 0],
		"heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 10, 9, 35],
		"heatmap-weight": 1,
	},
};

export const MapLayerHeatmap = (props: Partial<Omit<HeatmapLayerSpecification, "id">>) => {
	return (
		<Layer
			{...heatmap}
			{...props}
		/>
	);
};
