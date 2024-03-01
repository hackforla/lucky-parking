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

interface SingleSearchVisualizationProps {
  onClose: onEvent;
  region: GeocodeResult;
  regionType: RegionType;
}

export default function SingleSearchVisualization(props: SingleSearchVisualizationProps) {
  const { onClose, region, regionType } = props;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || getFirst(CitationDataCategories));
  const [datePreset, setDatePreset] = useState(searchParams.get("date_preset") || getFirst(RelativeDatePresets));
  const [dates, setDates] = useState(calculateDateRange(getFirst(RelativeDatePresets)));
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [customDateToggle, setCustomDateToggle] = useState(false);

  const onDatePresetSelect = (preset: RelativeDatePresets) => {
    setCustomDateToggle(false);
    setDateFrom(null);
    setDateTo(null);

    setDates(calculateDateRange(preset));
    setDatePreset(preset);
    setSearchParams((prevParams) => {
      prevParams.set("date_from", formatToMiddleEndian(dates[0]));
      prevParams.set("date_to", formatToMiddleEndian(dates[1]));
      return prevParams;
    })
  };

  const onCategorySelect = (value: string) => {
    setCategory(value);
    setSearchParams((prevParams) => {
      prevParams.set("category", value);
      return prevParams;
    });
  }

  const onCustomDateSelect = (value: object) => {
    console.log(value);
    if (value.id === "From") {
      setDateFrom(value.date);
    }
    if (value.id === "To") {
      setDateTo(value.date);
    }
  }

  useEffect(() =>  {
    if (dateFrom && dateTo) {
      setCustomDateToggle(true);
    }
  }, [dateFrom, dateTo]);


  useEffect(() => {
    if (customDateToggle && dateFrom && dateTo) {
      const a = new Date(dateFrom);
      const b = new Date(dateTo);
      setDates([a, b])

    }
  }, [customDateToggle, dateFrom, dateTo]);

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
          dateFrom={dateFrom}
          dateTo={dateTo}
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
