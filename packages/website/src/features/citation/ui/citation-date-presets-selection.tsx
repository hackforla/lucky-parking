import _ from "lodash";
import PickList from "@lucky-parking/ui/src/components/pick-list";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { onEvent } from "@/shared/lib/types";

interface CitationDataPresetsSelection {
  onSelect: onEvent;
}

const CITATION_DATE_PRESETS = _.map(RelativeDatePresets, (value, key) => ({ value, text: value }));

export default function CitationDatePresetsSelection(props: CitationDataPresetsSelection) {
  const { onSelect } = props;

  return (
    <PickList
      id="citation-date-presets"
      className="h-[48px] w-[135px] py-1 text-[15.88px] leading-[16.83px]"
      onChange={onSelect}
      options={CITATION_DATE_PRESETS}
      placeholder={CITATION_DATE_PRESETS[0].text}
    />
  );
}
