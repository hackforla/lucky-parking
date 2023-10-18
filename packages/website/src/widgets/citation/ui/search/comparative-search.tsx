import _ from "lodash";
import { useState } from "react";
import Button, { ButtonSize, ButtonVariant } from "@lucky-parking/ui/src/components/button";
import Geocoder, { PLACE_TYPE_BY_REGION_TYPE, RegionType, RegionTypesSelection } from "@/features/geocoder";
import type { GeocodeResult, onEvent } from "@/shared/lib/types";
import CitationExplorerSection from "../explorer/citation-explorer-section";
import CitationExplorerSectionTitle from "../explorer/citation-explorer-section-title";
import CitationExplorerTitle from "../explorer/citation-explorer-title";
import ComparativeSearchVisualizationFocused from "../visualization/comparative-search-visualization-focused";

import { StepperContainer } from "@lucky-parking/ui/src/components/stepper/stepper-container";
import { StepperItem } from "@lucky-parking/ui/src/components/stepper/stepper-item";

const GEOCODER_PLACEHOLDERS = {
  [RegionType.NEIGHBORHOOD_COUNCIL]: "Search a neighborhood or select on the map",
  [RegionType.ZIP_CODE]: "Search a zip code or select on the map",
  [RegionType.PLACE]: "Search a location or address to focus the map",
  [RegionType.DRAWING]: "Click here to begin a drawing",
};

interface ComparativeSearchProps {
  onClose: onEvent;
  onRegion1Select: onEvent;
  onRegion2Select: onEvent;
  onRegionTypeSelect: onEvent;
  onSubmit: onEvent;
  region1: GeocodeResult;
  region2: GeocodeResult;
  regionType: RegionType;
}

export default function ComparativeSearch(props: ComparativeSearchProps) {
  const { onClose, onRegion1Select, onRegion2Select, onRegionTypeSelect, onSubmit, region1, region2, regionType } =
    props;

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

  const firstRegionTitleContainer = (
    <div className="flex justify-between">
      <CitationExplorerSectionTitle>First Region</CitationExplorerSectionTitle>
      {region1 && (
        <Button variant={ButtonVariant.text} onClick={() => setDataFocus(1)}>
          See Data 1
        </Button>
      )}
    </div>
  );

  const secondRegionTitleContainer = (
    <div className="flex justify-between">
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
        <StepperContainer currentStep={1}>
          <StepperItem
            title={<CitationExplorerSectionTitle>Select One Region Type to Compare</CitationExplorerSectionTitle>}
            isFinished={false}>
            <div className="my-3">
              <RegionTypesSelection onChange={onRegionTypeSelect} />
            </div>
          </StepperItem>

          <StepperItem title={firstRegionTitleContainer} isFinished={false}>
            <div className="my-3">
              <Geocoder
                onSelect={onRegion1Select}
                placeholder={GEOCODER_PLACEHOLDERS[regionType] || ""}
                filters={PLACE_TYPE_BY_REGION_TYPE[regionType]}
                isDisabled={_.isNil(regionType)}
              />
            </div>
          </StepperItem>

          <StepperItem title={secondRegionTitleContainer}>
            <div className="my-3 justify-self-end">
              <Geocoder
                onSelect={onRegion2Select}
                placeholder={GEOCODER_PLACEHOLDERS[regionType] || ""}
                filters={regionType && PLACE_TYPE_BY_REGION_TYPE[regionType]}
                isDisabled={_.isNil(regionType)}
              />
            </div>
          </StepperItem>
        </StepperContainer>

        <Button size={ButtonSize.large} onClick={onSubmit} isDisabled={!(region1 || region2)}>
          Comparison Chart
        </Button>
      </CitationExplorerSection>
    </>
  );
}
