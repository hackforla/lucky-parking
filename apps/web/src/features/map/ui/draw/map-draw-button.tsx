import _ from "lodash";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ButtonVariant } from "@lucky-parking/ui/button";
import CreateIcon from "@mui/icons-material/Create";
import { useMapDraw } from "@/entities/map/lib/controls";
import { actions, selectors } from "@/shared/data/store/ui-slice";

export default function MapDrawButton() {
  const dispatch = useDispatch();
  const { draw } = useMapDraw();
  const ui = useSelector(selectors.selectUi);

  const onClick = useCallback(() => {
    if (_.isNil(draw) || ui.drawing) return;

    draw.changeMode("draw_polygon");
    dispatch(actions.setMapInstructionsVisible(!ui.isMapInstructionsVisible));
  }, [draw, ui.drawing]);

  return (
    <Button variant={ButtonVariant.outline} onClick={onClick}>
      <CreateIcon />
      <p>Draw Boundary</p>
    </Button>
  );
}
