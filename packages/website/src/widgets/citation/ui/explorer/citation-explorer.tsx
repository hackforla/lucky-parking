import _ from "lodash";
import { useState } from "react";
import { PlaceType, REGION_TYPE_BY_PLACE_TYPE, RegionType } from "@/features/geocoder/lib/constants";
import { selectors } from "@/shared/data/store/ui-slice";
import { GeocodeResult } from "@/shared/lib/types";
import { useSelector } from "react-redux";
import ComparativeSearch from "../search/comparative-search";
import DrawSearch from "../search/draw-search";
import SingleSearch from "../search/single-seach";
import ComparativeSearchVisualization from "../visualization/comparative-search-visualization";
import SingleSearchVisualization from "../visualization/single-search-visualization";

export default function CitationExplorer() {
  const ui = useSelector(selectors.selectUi);
  const [isSingleSearchMode, setSingleSearchMode] = useState(true);
  const [isVisualizationMode, setVisualizationMode] = useState(false);
  const [regionType, setRegionType] = useState<RegionType | null>(null);
  const [region1, setRegion1] = useState<GeocodeResult | null>(null);
  const [region2, setRegion2] = useState<GeocodeResult | null>(null);

  const onSearchModeToggle = () => {
    setSingleSearchMode((prevState) => !prevState);
    setRegionType(null);
    setRegion1(null);
    setRegion2(null);
  };

  const onVisualizationModeToggle = () => setVisualizationMode((prevState) => !prevState);

  const onRegionSelect = (feature: GeocodeResult) => {
    if (_.isNil(feature)) return;

    setRegion1(feature);
    setRegionType(REGION_TYPE_BY_PLACE_TYPE[_.first(feature.place_type) as PlaceType]);
    setVisualizationMode(true);
  };

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
        onClose={onVisualizationModeToggle}
        region1={region1 as GeocodeResult}
        region2={region2 as GeocodeResult}
        regionType={regionType as RegionType}
      />
    );
  }

  return isSingleSearchMode ? (
    <SingleSearch onToggle={onSearchModeToggle} onSelect={onRegionSelect} />
  ) : (
    <ComparativeSearch
      onClose={onSearchModeToggle}
      onRegion1Select={setRegion1}
      onRegion2Select={setRegion2}
      onRegionTypeSelect={setRegionType}
      onSubmit={onVisualizationModeToggle}
      region1={region1 as GeocodeResult}
      region2={region2 as GeocodeResult}
      regionType={regionType as RegionType}
    />
  );
}
