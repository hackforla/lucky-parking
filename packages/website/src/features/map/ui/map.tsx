import _ from "lodash";
import MapGL, { MapProps as MapGLProps } from "react-map-gl";
import losAngelesFeature from "@/shared/data/feature-collections/los-angeles.json";
import "mapbox-gl/dist/mapbox-gl.css";

const LOS_ANGELES_CENTER = _.chain(losAngelesFeature.features).first().get("center").value();
const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
const DEFAULT_VIEW_STATE = {
  zoom: 10,
  longitude: _.first(LOS_ANGELES_CENTER),
  latitude: _.nth(LOS_ANGELES_CENTER, 1),
};

interface MapProps extends MapGLProps {
  name: string;
}

export default function Map(props: MapProps) {
  const { name, initialViewState } = props;

  return (
    <MapGL
      failIfMajorPerformanceCaveat
      id={name}
      initialViewState={DEFAULT_VIEW_STATE}
      mapStyle={DEFAULT_MAP_STYLE}
      mapboxAccessToken={import.meta.env["VITE_MAPBOX_TOKEN"]}
    />
  );
}
