import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { ButtonProps, ButtonVariant } from "@lucky-parking/ui/src/components/button";
import { useMapDraw } from "@/entities/map/lib/controls";
import { actions, selectors } from "@/shared/data/store/ui-slice";
import MapDrawActionButton from "./map-draw-action-button";

export default function MapDrawClearButton(props: ButtonProps) {
  const { onClick = _.noop } = props;

  const { draw } = useMapDraw();
  const ui = useSelector(selectors.selectUi);
  const dispatch = useDispatch();

  const _onClick = () => {
    if (_.isNil(draw)) return;

    draw.deleteAll();
    draw.changeMode("draw_polygon");
    dispatch(actions.setMapDrawing(null));
    onClick();
  };

  return (
    <MapDrawActionButton isDisabled={!ui.drawing} onClick={_onClick} variant={ButtonVariant.outline}>
      Clear
    </MapDrawActionButton>
  );
}
