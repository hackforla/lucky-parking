import type { onEvent } from "@/shared/lib/types";
import DateInput from "@lucky-parking/ui/src/components/date-input";
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

        <p className="paragraph-2 text-black-400 font-medium">or</p>

        <div className="flex flex-auto items-center space-x-1">
          <DateInput>From</DateInput>
          <DateInput>To</DateInput>
        </div>
      </div>
    </>
  );
}
