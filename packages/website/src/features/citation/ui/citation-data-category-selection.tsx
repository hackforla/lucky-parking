import _ from "lodash";

import PickList from "@lucky-parking/ui/src/components/pick-list";
import type { onEvent } from "@/shared/lib/types";
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
      value={CITATION_DATA_CATEGORIES[0].value}
    />
  );
}
