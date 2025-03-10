import _ from "lodash";
import { useSelector } from "react-redux";
import { ButtonProps, ButtonVariant } from "@lucky-parking/ui/button";
import { selectors } from "@/shared/data/store/ui-slice";
import MapDrawActionButton from "./map-draw-action-button";

export default function MapDrawApplyButton(props: ButtonProps) {
  const { onClick = _.noop } = props;

  const ui = useSelector(selectors.selectUi);

  const _onClick = () => {
    // TODO: Call API to fetch data
    onClick();
  };

  return (
    <MapDrawActionButton isDisabled={!ui.drawing} onClick={_onClick} variant={ButtonVariant.secondary}>
      Apply
    </MapDrawActionButton>
  );
}
