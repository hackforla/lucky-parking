import _ from "lodash";
import { useEffect } from "react";
import MapGL, { LngLatLike, MapProps as MapGLProps } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";
import losAngelesFeature from "@/shared/data/feature-collections/los-angeles.json";
import { actions, selectors } from "@/shared/data/store/ui-slice";
import useMap from "./use-map";
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

export default function Map({ children, ...props }: MapProps) {
  const { name } = props;

  const ui = useSelector(selectors.selectUi);

  const dispatch = useDispatch();
  const map = useMap();

  useEffect(() => {
    dispatch(actions.setCurrentMap(name));
  }, []);

  useEffect(() => {
    if (!map) return;

    if (!ui.selectedFeature?.center) {
      map.flyTo({
        center: LOS_ANGELES_CENTER as LngLatLike,
        zoom: DEFAULT_VIEW_STATE.zoom,
      });
      return;
    }

    if (_.isArray(ui.selectedFeature.center)) {
      map.flyTo({
        center: ui.selectedFeature.center,
        zoom: 18,
      });

      return;
    }

    map.flyTo({
      center: ui.selectedFeature.center.geometry.coordinates as LngLatLike,
      zoom: 16,
    });
  }, [map, ui.selectedFeature]);

  return (
    <MapGL
      failIfMajorPerformanceCaveat
      id={name}
      initialViewState={DEFAULT_VIEW_STATE}
      mapStyle={DEFAULT_MAP_STYLE}
      mapboxAccessToken={process.env["VITE_MAPBOX_TOKEN"] || ""}>
      {children}
    </MapGL>
  );
}
