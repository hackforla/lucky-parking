import _ from "lodash";
import type { Nil } from "@lucky-parking/types";
import { createContext, MutableRefObject, PropsWithChildren, useCallback, useRef, useState } from "react";
import { MapProvider as MapGLProvider } from "react-map-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

type DrawControl = MapboxDraw | Nil;
type DrawControlRef = MutableRefObject<MapboxDraw | undefined | null> | Nil;
type DrawControlDispatch = (...args: any[]) => void;

interface MapProviderState {
  draw: DrawControl;
  drawRef: DrawControlRef | null;
}

interface MapProviderDispatch {
  setDrawControl: DrawControlDispatch;
}

export const MapContext = createContext<MapProviderState>({
  draw: null,
  drawRef: null,
});

export const MapDispatchContext = createContext<MapProviderDispatch>({
  setDrawControl: _.noop,
});

export default function MapProvider({ children }: PropsWithChildren) {
  const [draw, setDraw] = useState<MapboxDraw | Nil>(null);
  const drawRef = useRef<MapboxDraw>(null);

  const setDrawControl = useCallback((control: MapboxDraw) => {
    drawRef.current = control;
    setDraw(drawRef.current);
  }, []);

  return (
    <MapGLProvider>
      <MapContext.Provider value={{ draw, drawRef }}>
        <MapDispatchContext.Provider value={{ setDrawControl }}>{children}</MapDispatchContext.Provider>
      </MapContext.Provider>
    </MapGLProvider>
  );
}
