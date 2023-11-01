import _ from "lodash";
import type { onEvent } from "@/shared/lib/types";
import RadioGroup from "@/shared/ui/radio-group";
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
