import { useContext } from "react";
import { MapContext, MapDispatchContext } from "../provider/map-provider";

export default function useMapDraw() {
  const { draw, drawRef } = useContext(MapContext);
  const { setDrawControl } = useContext(MapDispatchContext);

  return {
    draw,
    drawRef,
    setDraw: setDrawControl,
  };
}
