import type { onEvent, Nil } from "@lucky-parking/typings";
import DateInput from "@lucky-parking/ui/src/components/date-input";
import CitationDataCategorySelection from "./citation-data-category-selection";
import CitationDatePresetsSelection from "./citation-date-presets-selection";

interface CitationDataFilterProps {
  onCategorySelect: onEvent;
  onDatePresetSelect: onEvent;
  onCustomDateSelect: onEvent;
  category: string;
  datePreset: string;
  customDateFromInput: Date | Nil;
  customDateToInput: Date | Nil;
}

export default function CitationDataFilter(props: CitationDataFilterProps) {
  const { onCategorySelect, onDatePresetSelect, onCustomDateSelect, category, datePreset, customDateFromInput, customDateToInput } = props;

  return (
  	<>
  		<CitationDataCategorySelection category={category} onSelect={onCategorySelect} />
  		<div className="flex w-full items-center space-x-2">
  			<CitationDatePresetsSelection datePreset={datePreset} onSelect={onDatePresetSelect} />
  			<p className="paragraph-2 text-black-400 font-medium">or</p>
  			<div className="flex flex-auto items-center space-x-1">
  				<DateInput id="From" date={customDateFromInput} onSelect={onCustomDateSelect}>From</DateInput>
  				<DateInput id="To" date={customDateToInput} onSelect={onCustomDateSelect}>To</DateInput>
  			</div>
  		</div>
  	</>
  );
}
