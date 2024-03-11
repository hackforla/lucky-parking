import _ from "lodash";
import { useEffect, useState } from "react";
import { PlaceType, REGION_TYPE_BY_PLACE_TYPE, RegionType } from "@/features/geocoder/lib/constants";
import { selectors } from "@/shared/data/store/ui-slice";
import { GeocodeResult } from "@/shared/lib/types";
import { useSelector } from "react-redux";
import ComparativeSearch from "../search/comparative-search";
import DrawSearch from "../search/draw-search";
import SingleSearch from "../search/single-seach";
import ComparativeSearchVisualization from "../visualization/comparative-search-visualization";
import SingleSearchVisualization from "../visualization/single-search-visualization";
import useCitationSearchParams from "@/features/citation/ui/use-citation-search-params";

export default function CitationExplorer() {
  const ui = useSelector(selectors.selectUi);
  const citationSearchParams = useCitationSearchParams();
  const [isSingleSearchMode, setSingleSearchMode] = useState(citationSearchParams.compareMode.get() === null);
  const [isVisualizationMode, setVisualizationMode] = useState(false);
  const [regionType, setRegionType] = useState<RegionType | null>(citationSearchParams.placeType.get() as RegionType);
  const [region1, setRegion1] = useState<GeocodeResult | null>(null); 
  const [region2, setRegion2] = useState<GeocodeResult | null>(null);

  const onSearchModeToggle = () => {
    setSingleSearchMode((prevState) => !prevState);
    setRegionType(null);
    setRegion1(null);
    setRegion2(null);
    citationSearchParams.clearSearchParams();
  };

  const onVisualizationModeToggle = () => {
    setVisualizationMode((prevState) => !prevState);
    citationSearchParams.clearSearchParams();
  };

  const onComparativeVisualizationModeToggle = () => {
    setVisualizationMode((prevState) => !prevState);
  }

  // For single search mode
  const onRegionSelect = (feature: GeocodeResult) => {
    if (_.isNil(feature)) return;

    setRegion1(feature);
    setRegionType(REGION_TYPE_BY_PLACE_TYPE[_.first(feature.place_type) as PlaceType]);
    setVisualizationMode(true);

    if (citationSearchParams.searchParams.size == 0) {
      citationSearchParams.placeName.set(feature.place_name);
      citationSearchParams.placeType.set(feature.place_type[0]);
    }
  };

  // For comparative search mode
  const onRegionTypeSelect = (regionType: RegionType) => {
    setRegionType(regionType)
    citationSearchParams.placeType.set(regionType);
  }

  const onRegion1Select = (feature: GeocodeResult) => {
    if (_.isNil(feature)) return;

    setRegion1(feature);
    citationSearchParams.region1.set(feature.place_name);
  }

  const onRegion2Select = (feature: GeocodeResult) => {
    if (_.isNil(feature)) return;

    setRegion2(feature);
    citationSearchParams.region2.set(feature.place_name);
  }

  useEffect(() => {
    if (!isSingleSearchMode) {
      citationSearchParams.compareMode.set();
    }
  }, [isSingleSearchMode])

  if (ui.isMapInstructionsVisible) {
    return <DrawSearch />;
  }

  if (isVisualizationMode && isSingleSearchMode) {
    return (
      <SingleSearchVisualization
        regionType={regionType as RegionType}
        region={region1 as GeocodeResult}
        onClose={onVisualizationModeToggle}
      />
    );
  }

  if (isVisualizationMode && !isSingleSearchMode) {
    return (
      <ComparativeSearchVisualization
        onClose={onComparativeVisualizationModeToggle}
        region1={region1 as GeocodeResult}
        region2={region2 as GeocodeResult}
        regionType={regionType as RegionType}
      />
    );
  }

  return isSingleSearchMode ? (
    <SingleSearch onToggle={onSearchModeToggle} onSelect={onRegionSelect} savedQuery={citationSearchParams.placeName.get()} />
  ) : (
    <ComparativeSearch
      onClose={onSearchModeToggle}
      onRegion1Select={onRegion1Select}
      onRegion2Select={onRegion2Select}
      onRegionTypeSelect={onRegionTypeSelect}
      onSubmit={onComparativeVisualizationModeToggle}
      region1={region1 as GeocodeResult}
      region2={region2 as GeocodeResult}
      regionType={regionType as RegionType}
      region1SavedQuery={citationSearchParams.region1.get()}
      region2SavedQuery={citationSearchParams.region2.get()}
    />
  );
}
