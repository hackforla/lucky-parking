import { useEffect, useState } from "react";
import type { onEvent } from "@lucky-parking/types";
import { formatToRangeString } from "@lucky-parking/utilities/date";
import { getFirst } from "@lucky-parking/utilities/enum";
import { Tag } from "@lucky-parking/ui/tag";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import FakeInput from "@/shared/ui/fake-input";
import type { GeocodeResult } from "@/shared/lib/types";
import { calculateDateRange } from "@/shared/lib/utilities/date";
import type { RegionType } from "@/features/geocoder";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";
import useCitationSearchParams from "@/features/citation/ui/use-citation-search-params";

interface SingleSearchVisualizationProps {
  onClose: onEvent;
  region: GeocodeResult;
  regionType: RegionType;
}

export default function SingleSearchVisualization(props: SingleSearchVisualizationProps) {
  const { onClose, region, regionType } = props;

  const citationSearchParams = useCitationSearchParams();
  const hasSavedDateRange = citationSearchParams.dateRange.get() !== null;
  const [category, setCategory] = useState(citationSearchParams.category.get() || getFirst(CitationDataCategories));
  const [datePreset, setDatePreset] = useState(citationSearchParams.datePreset.get() || getFirst(RelativeDatePresets));
  const [dateRange, setDateRange] = useState<Date[]>(
    citationSearchParams.dateRange.get() || calculateDateRange(datePreset),
  );
  const [customDateFromInput, setCustomDateFromInput] = useState<Date | null>(hasSavedDateRange ? dateRange[0] as Date : null);
  const [customDateToInput, setCustomDateToInput] = useState<Date | null>(hasSavedDateRange ? dateRange[1] as Date : null);
  const [customDateToggle, setCustomDateToggle] = useState(false);

  const onDatePresetSelect = (preset: RelativeDatePresets) => {
    setCustomDateToggle(false);
    setCustomDateFromInput(null);
    setCustomDateToInput(null);

    setDateRange(calculateDateRange(preset));
    setDatePreset(preset);
    citationSearchParams.dateRange.set(preset);
  };

  const onCategorySelect = (value: string) => {
    setCategory(value);
    citationSearchParams.category.set(value);
  };

  const onCustomDateSelect = (value: { id: string; date: Date }) => {
    if (value.id === "From") {
      setCustomDateFromInput(value.date);
    }
    if (value.id === "To") {
      setCustomDateToInput(value.date);
    }
  };

  useEffect(() => {
    if (customDateFromInput && customDateToInput) {
      setCustomDateToggle(true);
    }
  }, [customDateFromInput, customDateToInput]);

  useEffect(() => {
    if (customDateToggle && customDateFromInput && customDateToInput) {
      const a = new Date(customDateFromInput);
      const b = new Date(customDateToInput);
      setDateRange([a, b]);
      citationSearchParams.dateRange.set([a, b]);
    }
  }, [customDateToggle, customDateFromInput, customDateToInput]);

  const mockDataset = [{ data: [] }];

  return (
    <>
      <CitationExplorerSection>
        <CitationExplorerSectionTitle>
          <div className="-mb-[8.75px] flex items-center space-x-3">
            <p>Region Type</p>
            <Tag>{regionType}</Tag>
          </div>
        </CitationExplorerSectionTitle>

        <FakeInput onClose={onClose}>{region.place_name}</FakeInput>
      </CitationExplorerSection>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataFilter
          onCategorySelect={onCategorySelect}
          onDatePresetSelect={onDatePresetSelect}
          onCustomDateSelect={onCustomDateSelect}
          category={category}
          datePreset={datePreset}
          customDateFromInput={customDateFromInput}
          customDateToInput={customDateToInput}
        />
      </CitationExplorerSection>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataInsights
          category={category}
          datasets={mockDataset}
          dates={formatToRangeString(dateRange as [Date, Date])}
          onClick={() => {}}
          stat="112,338"
          title={region.place_name}
        />
      </CitationExplorerSection>
    </>
  );
}
