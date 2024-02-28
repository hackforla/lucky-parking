import _ from "lodash";
import type { onEvent } from "@lucky-parking/typings";
import PickList from "@lucky-parking/ui/src/components/pick-list";
import { CitationDataCategories } from "../lib";

interface CitationDataCategorySelectionProps {
  onSelect: onEvent;
}

const CITATION_DATA_CATEGORIES = _.map(CitationDataCategories, (value, key) => ({ value, text: value }));

export default function CitationDataCategorySelection(props: CitationDataCategorySelectionProps) {
  const { onSelect } = props;

  return (
    <PickList
      id="citation-data-categories"
      className="h-[48px] text-[15.88px]"
      onChange={onSelect}
      options={CITATION_DATA_CATEGORIES}
      placeholder={CITATION_DATA_CATEGORIES[0].text}
    />
  );
}
