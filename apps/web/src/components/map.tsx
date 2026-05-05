import losAngelesCountyFeatures from "data/los-angeles-county.json";
import losAngelesFeatures from "data/los-angeles.json";
import _ from "lodash";
import { type MapMouseEvent } from "mapbox-gl";
import { useState, useRef } from "react";
import MapboxMap, { NavigationControl, LngLatBoundsLike, MapEvent, MapRef, Popup } from "react-map-gl/mapbox";
import { MapLayerCircles, MAP_LAYER_CIRCLES_ID } from "@/components/map-layer-circles";
import { MapLayerHeatmap } from "@/components/map-layer-heatmap";
import { useMapResizer } from "@/hooks/use-map-resizer";
import { usePublicConfig } from "@/hooks/use-public-config";
import { ParkingCitationFeature } from "@/lib/socrata/parking-citations.schema";
import { MapSourceCitations } from "./map-source-citations";
import "mapbox-gl/dist/mapbox-gl.css";

const MAP_INITIAL_VIEW = { bounds: _.first(losAngelesFeatures.features)?.bbox as LngLatBoundsLike, zoom: 10 };
const MAP_INTERACTIVE_LAYERS = [MAP_LAYER_CIRCLES_ID];

const getFeatures = (event: MapMouseEvent, layers = MAP_INTERACTIVE_LAYERS) => {
	return event.target.queryRenderedFeatures(event.point, { layers });
};

export const ParkingCitationsMap = () => {
	const { data } = usePublicConfig();
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapRef>(null);
	const [isMapReady, setIsMapReady] = useState(false);
	const [selectedFeature, setSelectedFeature] = useState<ParkingCitationFeature | null>(null);
	const [cursor, setCursor] = useState<string>("");
	useMapResizer(mapRef, containerRef);

	const onMapLoad = (event: MapEvent) => {
		const map = event.target;

		if (!map?.isStyleLoaded()) {
			setIsMapReady(false);
			return;
		}

		setIsMapReady(true);
		globalThis.map = event.target;
	};

	const onMapClick = (event: MapMouseEvent) => {
		const [feature] = getFeatures(event);
		setSelectedFeature(feature as unknown as ParkingCitationFeature);
	};

	const onMapMouseMove = (event: MapMouseEvent) => {
		const features = getFeatures(event);
		setCursor(features.length ? "pointer" : "");
	};

	if (!data?.mapboxAccessToken) return null;

	return (
		<div
			ref={containerRef}
			className="z-10 h-full w-full overflow-hidden">
			<MapboxMap
				interactiveLayerIds={MAP_INTERACTIVE_LAYERS}
				ref={mapRef}
				id="parking-citations-map"
				mapboxAccessToken={data.mapboxAccessToken}
				initialViewState={MAP_INITIAL_VIEW}
				maxBounds={_.first(losAngelesCountyFeatures.features)?.bbox as LngLatBoundsLike}
				style={{ width: "100%", height: "100%" }}
				mapStyle="mapbox://styles/mapbox/standard"
				attributionControl={false}
				renderWorldCopies={false}
				reuseMaps
				onLoad={onMapLoad}
				onClick={onMapClick}
				onMouseMove={onMapMouseMove}
				cursor={cursor}>
				<NavigationControl />

				{selectedFeature ? (
					<Popup
						longitude={selectedFeature.geometry.coordinates[0]}
						latitude={selectedFeature.geometry.coordinates[1]}
						onClose={() => setSelectedFeature(null)}>
						<div>{selectedFeature.properties.ticket_number}</div>
					</Popup>
				) : null}

				{isMapReady ? (
					<MapSourceCitations>
						<MapLayerHeatmap />
						<MapLayerCircles />
					</MapSourceCitations>
				) : null}
			</MapboxMap>
		</div>
	);
};
