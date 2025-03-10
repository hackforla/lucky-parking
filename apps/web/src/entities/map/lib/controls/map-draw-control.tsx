import _ from "lodash";
import { forwardRef, useImperativeHandle } from "react";
import { useDispatch } from "react-redux";
import { ControlPosition, useControl } from "react-map-gl";
import MapboxDraw, { DrawCreateEvent, DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
// @ts-ignore: TS2307
import StaticMode from "@mapbox/mapbox-gl-draw-static-mode";
import { actions } from "@/shared/data/store/ui-slice";
// @ts-ignore: TS2307
import FreehandMode from "mapbox-gl-draw-freehand-mode";
import styles from "./map-draw-styles";
import useMapDraw from "./use-map-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

interface MapDrawControlProps {
  mapId: string;
  onCreate?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
  position?: ControlPosition;
}

export default forwardRef(function MapDrawControl(props: MapDrawControlProps, ref) {
  const { onCreate = _.noop, onDelete = _.noop, onUpdate = _.noop } = props;

  const { setDraw } = useMapDraw();
  const dispatch = useDispatch();

  const _onCreate = (event: DrawCreateEvent) => {
    dispatch(actions.setMapDrawing(_.first(event.features)));
    onCreate(event);
  };

  const _onDelete = (event: DrawDeleteEvent) => {
    dispatch(actions.setMapDrawing(null));
    onDelete(event);
  };

  const _onUpdate = (event: DrawUpdateEvent) => {
    dispatch(actions.setMapDrawing(_.first(event.features)));
    onUpdate(event);
  };

  const draw = useControl(
    () =>
      new (MapboxDraw as any)({
        styles,
        modes: { ...MapboxDraw.modes, static: StaticMode, draw_polygon: FreehandMode },
        displayControlsDefault: false,
        defaultMode: "static",
        ...props,
      }),
    ({ map }) => {
      map.on("draw.create", _onCreate);
      map.on("draw.update", _onUpdate);
      map.on("draw.delete", _onDelete);
    },
    ({ map }) => {
      map.off("draw.create", _onCreate);
      map.off("draw.update", _onUpdate);
      map.off("draw.delete", _onDelete);
    },
    { position: props.position },
  );

  useImperativeHandle(
    ref,
    () => {
      setDraw(draw);
      return draw;
    },
    [draw],
  );

  return null;
});
