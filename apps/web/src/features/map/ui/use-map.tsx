import { useMap as useMapGL } from "react-map-gl";
import { useSelector } from "react-redux";
import { selectors } from "@/shared/data/store/ui-slice";

export default function useMap() {
  const ui = useSelector(selectors.selectUi);
  const { [ui.currentMap || "current"]: map } = useMapGL();

  return map?.getMap();
}
