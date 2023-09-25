import _ from "lodash";
import { useState } from "react";
import { getFirstEnum } from "@/shared/lib/utilities/enum";
import type { onEvent } from "@/shared/lib/types";
import { CitationDataCategories } from "../lib";

interface CitationDataCategorySelectionProps {
  onSelect: onEvent;
}

export default function CitationDataCategorySelection(props: CitationDataCategorySelectionProps) {
  const { onSelect } = props;

  const [value, setValue] = useState(getFirstEnum(CitationDataCategories));

  const onChange = (newValue: string) => {
    setValue(newValue);
    onSelect(newValue);
  };

  return (
    <select name="citation-data-categories" value={value} onChange={(event) => onChange(event.target.value)}>
      {_.map(CitationDataCategories, (category) => (
        <option value={category} key={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
