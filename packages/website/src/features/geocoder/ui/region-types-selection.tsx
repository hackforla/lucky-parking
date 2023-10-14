import _ from "lodash";
import type { onEvent } from "@/shared/lib/types";
import RadioGroup from "@/shared/ui/radio-group";
import { RegionType } from "../lib/constants";

interface RegionTypesSelectionProps {
  onChange: onEvent;
}

export default function RegionTypesSelection(props: RegionTypesSelectionProps) {
  const { onChange } = props;

  return <RadioGroup name="region-type" options={_.values(RegionType)} onChange={onChange} />;
}
