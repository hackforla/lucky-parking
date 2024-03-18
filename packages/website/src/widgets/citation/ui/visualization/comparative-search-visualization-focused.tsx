import { useState } from "react";
import type { onEvent } from "@lucky-parking/typings";
import { formatToRangeString } from "@lucky-parking/utilities/dist/date";
import { getFirst } from "@lucky-parking/utilities/dist/enum";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { GeocodeResult } from "@/shared/lib/types";
import { calculateDateRange } from "@/shared/lib/utilities/date";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerTitle from "../explorer/citation-explorer-title";

interface ComparativeSearchVisualizationFocusedProps {
  number: number;
  onClose: onEvent;
  region: GeocodeResult;
}

export default function ComparativeSearchVisualizationFocused(props: ComparativeSearchVisualizationFocusedProps) {
  const { number, onClose, region } = props;

  const [category, setCategory] = useState(getFirst(CitationDataCategories));
  const [dates, setDates] = useState(calculateDateRange(getFirst(RelativeDatePresets)));

  const onDatePresetSelect = (preset: RelativeDatePresets) => {
    setDates(calculateDateRange(preset));
  };

  const mockDataset = [{ data: [] }];

  return (
    <>
      <CitationExplorerTitle onClose={onClose}>Region {number} Data</CitationExplorerTitle>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        {/* TODO: implement onCustomDateSelect based on date selection approach chosen */}
        <CitationDataFilter
          onCategorySelect={setCategory}
          onDatePresetSelect={onDatePresetSelect}
          onCustomDateSelect={() => {}}
        />
      </CitationExplorerSection>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataInsights
          category={category}
          datasets={mockDataset}
          dates={formatToRangeString(dates as Date[])}
          onClick={() => {}}
          stat="112,338"
          title={region.place_name}
        />
      </CitationExplorerSection>
    </>
  );
}
