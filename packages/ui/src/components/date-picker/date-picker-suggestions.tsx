import _ from "lodash";
import RadioGroup from "../radio-group";

interface DatePickerSuggestion {
  onSuggestionChange: (arg0: string) => void;
}

export enum RelativeDatePresets {
  "YEARS_1" = "Past 1 Year",
  "YTD" = "Year to Date",
  "MONTHS_3" = "3 Months",
  "MONTHS_1" = "1 Month",
}

const CITATION_DATE_PRESETS = _.map(RelativeDatePresets, (value) => value);

export default function DatePickerSuggestions(props: DatePickerSuggestion) {
  const { onSuggestionChange } = props;

  return (
    <div className="my-4 flex flex-1 flex-col items-start justify-center">
      <RadioGroup name="suggested date range preset" options={CITATION_DATE_PRESETS} onChange={onSuggestionChange} />
    </div>
  );
}
