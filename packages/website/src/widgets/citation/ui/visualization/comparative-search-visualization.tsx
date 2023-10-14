import { useState } from "react";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { GeocodeResult, onEvent } from "@/shared/lib/types";
import { calculateDateRange, formatToRange } from "@/shared/lib/utilities/date";
import { getFirstEnum } from "@/shared/lib/utilities/enum";
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

  const [category, setCategory] = useState(getFirstEnum(CitationDataCategories));
  const [dates, setDates] = useState(calculateDateRange(getFirstEnum(RelativeDatePresets)));

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
          dates={formatToRange(dates as Date[])}
          onClick={() => {}}
          title={regionType ? `${regionType} Comparison` : "Comparison"}
        />
      </CitationExplorerSection>
    </>
  );
}
