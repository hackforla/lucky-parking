import { useState } from "react";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { FeatureResult } from "@/features/geocoder";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { onEvent } from "@/shared/lib/types";
import { calculateDateRange, formatToRange } from "@/shared/lib/utilities/date";
import { getFirstEnum } from "@/shared/lib/utilities/enum";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerTitle from "../explorer/citation-explorer-title";

interface ComparativeSearchVisualizationFocusedProps {
  number: number;
  onClose: onEvent;
  region: FeatureResult;
}

export default function ComparativeSearchVisualizationFocused(props: ComparativeSearchVisualizationFocusedProps) {
  const { number, onClose, region } = props;

  const [category, setCategory] = useState(getFirstEnum(CitationDataCategories));
  const [dates, setDates] = useState(calculateDateRange(getFirstEnum(RelativeDatePresets)));

  const onDatePresetSelect = (preset: RelativeDatePresets) => {
    setDates(calculateDateRange(preset));
  };

  const mockDataset = [{ data: [] }];

  return (
    <>
      <CitationExplorerTitle onClose={onClose}>Region {number} Data</CitationExplorerTitle>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataFilter onCategorySelect={setCategory} onDatePresetSelect={onDatePresetSelect} />
      </CitationExplorerSection>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataInsights
          category={category}
          datasets={mockDataset}
          dates={formatToRange(dates as Date[])}
          onClick={() => {}}
          stat="112,338"
          title={region.place_name}
        />
      </CitationExplorerSection>
    </>
  );
}
