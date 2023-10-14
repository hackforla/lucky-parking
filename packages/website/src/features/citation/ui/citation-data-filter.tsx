import type { onEvent } from "@/shared/lib/types";
import DateInput from "@/shared/ui/date-input";
import CitationDataCategorySelection from "./citation-data-category-selection";
import CitationDatePresetsSelection from "./citation-date-presets-selection";

interface CitationDataFilterProps {
  onCategorySelect: onEvent;
  onDatePresetSelect: onEvent;
}

export default function CitationDataFilter(props: CitationDataFilterProps) {
  const { onCategorySelect, onDatePresetSelect } = props;

  return (
    <>
      <CitationDataCategorySelection onSelect={onCategorySelect} />

      <div className="flex w-full items-center space-x-2">
        <CitationDatePresetsSelection onSelect={onDatePresetSelect} />

        <p className="paragraph-2 font-medium">or</p>

        <div className="flex w-full items-center space-x-1">
          <DateInput>From</DateInput>
          <DateInput>To</DateInput>
        </div>
      </div>
    </>
  );
}
