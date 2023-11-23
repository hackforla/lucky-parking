import { useState } from "react";
import Tag from "@lucky-parking/ui/src/components/tag";
import { CitationDataCategories, CitationDataFilter, CitationDataInsights } from "@/features/citation";
import { RelativeDatePresets } from "@/shared/lib/constants/date";
import FakeInput from "@/shared/ui/fake-input";
import type { GeocodeResult, onEvent } from "@/shared/lib/types";
import { calculateDateRange, formatToRangeString } from "@/shared/lib/utilities/date";
import { getFirstEnum } from "@/shared/lib/utilities/enum";
import type { RegionType } from "@/features/geocoder";
import CitationExplorerDivider from "../explorer/citation-explorer-divider";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";

interface SingleSearchVisualizationProps {
  onClose: onEvent;
  region: GeocodeResult;
  regionType: RegionType;
}

export default function SingleSearchVisualization(props: SingleSearchVisualizationProps) {
  const { onClose, region, regionType } = props;

  const [category, setCategory] = useState(getFirstEnum(CitationDataCategories));
  const [dates, setDates] = useState(calculateDateRange(getFirstEnum(RelativeDatePresets)));

  const onDatePresetSelect = (preset: RelativeDatePresets) => {
    setDates(calculateDateRange(preset));
  };

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
        <CitationDataFilter onCategorySelect={setCategory} onDatePresetSelect={onDatePresetSelect} />
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
