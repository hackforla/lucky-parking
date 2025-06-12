import { useState } from "react";
import type { onEvent } from "@lucky-parking/types";
import { formatToRangeString } from "@lucky-parking/utilities/date";
import { getFirst } from "@lucky-parking/utilities/enum";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import type { GeocodeResult } from "@/shared/lib/types";
import { calculateDateRange } from "@/shared/lib/utilities/date";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerTitle from "../explorer/citation-explorer-title";
import useCitationSearchParams from "@/features/citation/ui/use-citation-search-params";

interface ComparativeSearchVisualizationProps {
  onClose: onEvent;
  region1: GeocodeResult;
  region2: GeocodeResult;
  regionType: string;
}

export default function ComparativeSearchVisualization(props: ComparativeSearchVisualizationProps) {
  const { onClose, region1, region2, regionType } = props;

  const citationSearchParams = useCitationSearchParams();
  const [category, setCategory] = useState(citationSearchParams.category.get() || getFirst(CitationDataCategories));
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

  const onCategorySelect = (value: string) => {
    setCategory(value);
    citationSearchParams.category.set(value);
  };

  return (
    <>
      <CitationExplorerTitle onClose={onClose}>Comparison Data</CitationExplorerTitle>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataFilter
          onCategorySelect={onCategorySelect}
          onDatePresetSelect={onDatePresetSelect}
          // TODO: implement onCustomDateSelect based on date selection approach chosen
          onCustomDateSelect={() => {}}
          category={category}
        />
      </CitationExplorerSection>

      <CitationExplorerSection>
        <CitationDataInsights
          category={category}
          datasets={mockDatasets}
          dates={formatToRangeString(dates as [Date, Date])}
          onClick={() => {}}
          title={regionType ? `${regionType} Comparison` : "Comparison"}
        />
      </CitationExplorerSection>
    </>
  );
}
