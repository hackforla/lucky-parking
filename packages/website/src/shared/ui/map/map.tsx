import MapGL, { MapProps as MapGLProps } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
const DEFAULT_VIEW_STATE = {
  zoom: 10,
  // Center of Los Angeles
  longitude: -118.242766,
  latitude: 34.053691,
};

interface MapProps extends MapGLProps {
  name: string | undefined;
}

export default function Map(props: MapProps) {
  const { name, initialViewState } = props;

  return (
    <MapGL
      mapboxAccessToken={import.meta.env["VITE_MAPBOX_TOKEN"]}
      id={name}
      initialViewState={DEFAULT_VIEW_STATE}
      failIfMajorPerformanceCaveat
      mapStyle={DEFAULT_MAP_STYLE}
    />
  );
}
