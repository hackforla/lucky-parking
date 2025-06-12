import _ from "lodash";
import { PropsWithChildren } from "react";
import { SearchSuggestion } from "@lucky-parking/ui/search-input";
import { Tag,TagColor } from "@lucky-parking/ui/tag";
import { GeocodeResult } from "@/shared/lib/types";
import { PlaceType, REGION_TYPE_BY_PLACE_TYPE, RegionType } from "../lib/constants";

type GeocoderResultColor = Record<string, TagColor>;

const COLOR: GeocoderResultColor = {
  [RegionType.NEIGHBORHOOD_COUNCIL]: TagColor.cyan,
  [RegionType.PLACE]: TagColor.violet,
  [RegionType.ZIP_CODE]: TagColor.blue,
};

interface GeocoderResultProps extends PropsWithChildren {
  feature: GeocodeResult;
  onClick: (arg0?: any) => void;
}

export default function GeocoderResult({ children, ...props }: GeocoderResultProps) {
  const { feature, onClick } = props;

  const regionType = REGION_TYPE_BY_PLACE_TYPE[_.first(feature.place_type) as PlaceType];

  return (
    <SearchSuggestion onClick={onClick}>
      <p className="paragraph-2 line-clamp-1 text-ellipsis">{children}</p>
      <Tag color={COLOR[regionType as string] as TagColor}>{regionType}</Tag>
    </SearchSuggestion>
  );
}
