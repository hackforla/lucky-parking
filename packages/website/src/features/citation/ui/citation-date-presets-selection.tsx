import _ from "lodash";
import { useState } from "react";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { onEvent } from "@/shared/lib/types";
import { getFirstEnum } from "@/shared/lib/utilities/enum";

interface CitationDataPresetsSelection {
  onSelect: onEvent;
}

export default function CitationDataPresetsSelection(props: CitationDataPresetsSelection) {
  const { onSelect } = props;

  const [value, setValue] = useState(getFirstEnum(RelativeDatePresets));

  const onChange = (newValue: string) => {
    setValue(newValue);
    onSelect(newValue);
  };

  return (
    <select
      name="citation-date-presets"
      className="w-1/3"
      value={value}
      onChange={(event) => onChange(event.target.value)}>
      {_.map(RelativeDatePresets, (preset) => (
        <option value={preset} key={preset}>
          {preset}
        </option>
      ))}
    </select>
  );
}
