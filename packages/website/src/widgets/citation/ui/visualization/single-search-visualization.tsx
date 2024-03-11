import { useEffect, useState } from "react";
import type { onEvent } from "@lucky-parking/typings";
import { formatToRangeString } from "@lucky-parking/utilities/dist/date";
import { getFirst } from "@lucky-parking/utilities/dist/enum";
import Tag from "@lucky-parking/ui/src/components/tag";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import FakeInput from "@/shared/ui/fake-input";
import type { GeocodeResult } from "@/shared/lib/types";
import { calculateDateRange } from "@/shared/lib/utilities/date";
import type { RegionType } from "@/features/geocoder";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";
import { useSearchParams } from "react-router-dom";
import { formatToMiddleEndian } from "@lucky-parking/utilities/dist/date";
import useCitationSearchParams from "@/features/citation/ui/use-citation-search-params";

interface SingleSearchVisualizationProps {
  onClose: onEvent;
  region: GeocodeResult;
  regionType: RegionType;
}

export default function SingleSearchVisualization(props: SingleSearchVisualizationProps) {
  const { onClose, region, regionType } = props;
  
  const citationSearchParams = useCitationSearchParams();
  const [category, setCategory] = useState(citationSearchParams.category.get() || getFirst(CitationDataCategories));
  const [datePreset, setDatePreset] = useState(citationSearchParams.datePreset.get() || getFirst(RelativeDatePresets));
  const [dateRange, setDateRange] = useState<Date[]>(citationSearchParams.dateRange.get() || calculateDateRange(datePreset));
  const [hasSavedDateRange, setHasSavedDateRange] = useState(citationSearchParams.dateRange.get() !== null);
  const [customDateFromInput, setCustomDateFromInput] = useState<Date | null>(hasSavedDateRange ? dateRange[0]: null);
  const [customDateToInput, setCustomDateToInput] = useState<Date | null>(hasSavedDateRange ? dateRange[1]: null);
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
  }

  const onCustomDateSelect = (value: {id: string, date: Date} ) => {
    console.log(value);
    if (value.id === "From") {
      setCustomDateFromInput(value.date);
    }
    if (value.id === "To") {
      setCustomDateToInput(value.date);
    }
  }

  useEffect(() =>  {
    if (customDateFromInput && customDateToInput) {
      setCustomDateToggle(true);
    }
  }, [customDateFromInput, customDateToInput]);


  useEffect(() => {
    if (customDateToggle && customDateFromInput && customDateToInput) {
      const a = new Date(customDateFromInput);
      const b = new Date(customDateToInput);
      setDateRange([a, b])
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
          // dateRange={hasSavedDateRange ? dateRange: null}
          customDateFromInput={customDateFromInput}
          customDateToInput={customDateToInput}
        />
      </CitationExplorerSection>

      <CitationExplorerDivider />

      <CitationExplorerSection>
        <CitationDataInsights
          category={category}
          datasets={mockDataset}
          dates={formatToRangeString(dateRange as Date[])}
          onClick={() => {}}
          stat="112,338"
          title={region.place_name}
        />
      </CitationExplorerSection>
    </>
  );
}
