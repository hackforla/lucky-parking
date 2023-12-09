import { useState } from "react";
import { formatToRangeString } from "@lucky-parking/utilities/dist/date";
import { getFirst } from "@lucky-parking/utilities/dist/enum";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { GeocodeResult, onEvent } from "@/shared/lib/types";
import { calculateDateRange } from "@/shared/lib/utilities/date";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerTitle from "../explorer/citation-explorer-title";

interface ComparativeSearchVisualizationProps {
  onClose: onEvent;
  region1: GeocodeResult;
  region2: GeocodeResult;
  regionType: string;
}

export default function ComparativeSearchVisualization(props: ComparativeSearchVisualizationProps) {
  const { onClose, region1, region2, regionType } = props;

  const [category, setCategory] = useState(getFirst(CitationDataCategories));
  const [dates, setDates] = useState(calculateDateRange(getFirst(RelativeDatePresets)));

  const mockDatasets = [
    {
      name: region1.place_name,
      data: [],
    },
    {
      name: region2.place_name,
      data: [],
    },
  ];

  const onDatePresetSelect = (preset: RelativeDatePresets) => {
    setDates(calculateDateRange(preset));
  };

  return (
    <>
      <CitationExplorerTitle onClose={onClose}>Comparison Data</CitationExplorerTitle>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataFilter onCategorySelect={setCategory} onDatePresetSelect={onDatePresetSelect} />
      </CitationExplorerSection>

      <CitationExplorerSection>
        <CitationDataInsights
          category={category}
          datasets={mockDatasets}
          dates={formatToRangeString(dates as Date[])}
          onClick={() => {}}
          title={regionType ? `${regionType} Comparison` : "Comparison"}
        />
      </CitationExplorerSection>
    </>
  );
}
