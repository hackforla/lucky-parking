import _ from "lodash";
import type { onEvent } from "@lucky-parking/types";
import { RadioGroup } from "@lucky-parking/ui/radio-group";
import { RegionType } from "../lib/constants";

interface RegionTypesSelectionProps {
  onChange: onEvent;
  savedSelection?: string;
}

export default function RegionTypesSelection(props: RegionTypesSelectionProps) {
  const { onChange, savedSelection } = props;

  return (
    <RadioGroup name="region-type" options={_.values(RegionType)} onChange={onChange} savedSelection={savedSelection} />
  );
}
