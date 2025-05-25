import _ from "lodash";
import { useState } from "react";
import type { onEvent } from "@lucky-parking/types";
import { Button, ButtonSize, ButtonVariant } from "@lucky-parking/ui/button";
import Geocoder, { PLACE_TYPE_BY_REGION_TYPE, RegionType, RegionTypesSelection } from "@/features/geocoder";
import type { GeocodeResult } from "@/shared/lib/types";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";
import CitationExplorerTitle from "../explorer/citation-explorer-title";
import ComparativeSearchVisualizationFocused from "../visualization/comparative-search-visualization-focused";
import { StepperContainer, StepperItem } from "@lucky-parking/ui/stepper";

const GEOCODER_PLACEHOLDERS = {
  [RegionType.NEIGHBORHOOD_COUNCIL]: "Search a neighborhood or select on the map",
  [RegionType.ZIP_CODE]: "Search a zip code or select on the map",
  [RegionType.PLACE]: "Search a location or address to focus the map",
  [RegionType.DRAWING]: "Click here to begin a drawing",
};

interface ComparativeSearchProps {
  onClose: onEvent;
  onComparativeRegionSelect: onEvent;
  onRegionTypeSelect: onEvent;
  onClearRegion: onEvent;
  onSubmit: onEvent;
  region1: GeocodeResult;
  region2: GeocodeResult;
  regionType: RegionType;
  region1SavedQuery: string | null;
  region2SavedQuery: string | null;
}

export default function ComparativeSearch(props: ComparativeSearchProps) {
  const {
    onClose,
    onComparativeRegionSelect,
    onRegionTypeSelect,
    onClearRegion,
    onSubmit,
    region1,
    region2,
    regionType,
    region1SavedQuery,
    region2SavedQuery,
  } = props;

  const [dataFocus, setDataFocus] = useState<number | null>(null);

  if (dataFocus) {
    return (
      <ComparativeSearchVisualizationFocused
        number={dataFocus}
        onClose={() => setDataFocus(null)}
        region={dataFocus === 1 ? region1 : region2}
      />
    );
  }

  const getCurrentStep = () => {
    if (region1) {
      return 2;
    } else if (regionType) {
      return 1;
    } else {
      return 0;
    }
  };

  const currentStep = getCurrentStep();

  const regionTypeTitle = (
    <CitationExplorerSectionTitle>Select One Region Type to Compare</CitationExplorerSectionTitle>
  );

  const firstRegionTitleContainer = (
    <div className="flex w-[420px] justify-between">
      <CitationExplorerSectionTitle>First Region</CitationExplorerSectionTitle>
      {region1 && (
        <Button variant={ButtonVariant.text} onClick={() => setDataFocus(1)}>
          See Data 1
        </Button>
      )}
    </div>
  );

  const secondRegionTitleContainer = (
    <div className="flex w-[420px] justify-between">
      <CitationExplorerSectionTitle>Second Region</CitationExplorerSectionTitle>
      {region2 && (
        <Button variant={ButtonVariant.text} onClick={() => setDataFocus(2)}>
          See Data 2
        </Button>
      )}
    </div>
  );

  return (
    <>
      <CitationExplorerTitle onClose={onClose}>Compare Mode</CitationExplorerTitle>
      <CitationExplorerSection>
        <StepperContainer currentStep={currentStep}>
          <StepperItem title={regionTypeTitle} isFinished={!_.isNil(regionType)}>
            <div className="mb-3 mt-2">
              <RegionTypesSelection onChange={onRegionTypeSelect} savedSelection={regionType} />
            </div>
          </StepperItem>

          <StepperItem title={firstRegionTitleContainer} isFinished={!_.isNil(region1)}>
            <div className="mb-5 mt-2 w-[420px]">
              <Geocoder
                id="region1"
                onSelect={(value) => onComparativeRegionSelect({ id: "region1", feature: value })}
                placeholder={GEOCODER_PLACEHOLDERS[regionType] || ""}
                filters={PLACE_TYPE_BY_REGION_TYPE[regionType]}
                isDisabled={_.isNil(regionType)}
                savedQuery={region1SavedQuery}
                onClearRegion={onClearRegion}
              />
            </div>
          </StepperItem>

          <StepperItem title={secondRegionTitleContainer} isFinished={!_.isNil(region2)}>
            <div className="my-2 w-[420px]">
              <Geocoder
                id="region2"
                onSelect={(value) => onComparativeRegionSelect({ id: "region2", feature: value })}
                placeholder={GEOCODER_PLACEHOLDERS[regionType] || ""}
                filters={regionType && PLACE_TYPE_BY_REGION_TYPE[regionType]}
                isDisabled={_.isNil(regionType)}
                savedQuery={region2SavedQuery}
                onClearRegion={onClearRegion}
              />
            </div>
          </StepperItem>
        </StepperContainer>

        <Button size={ButtonSize.large} onClick={onSubmit} isDisabled={!(region1 && region2)} className="ml-8">
          <p>Comparison Chart</p>
        </Button>
      </CitationExplorerSection>
    </>
  );
}
