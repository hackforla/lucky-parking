import _ from "lodash";
import { PropsWithChildren } from "react";
import { SearchSuggestion } from "@lucky-parking/ui/src/components/search-input";
import { Tag } from "@lucky-parking/ui";
import { TagColor } from "@lucky-parking/ui/src/components/tag";
import { Result as IGeocoderResult } from "mapbox__mapbox-gl-geocoder";

interface GeocoderResultProps extends PropsWithChildren {
  feature: IGeocoderResult;
  onClick: (arg0?: any) => void;
}

const getTag = (feature: IGeocoderResult) => {
  switch (_.head(feature.place_type)) {
    case "postcode": {
      return "Zip Code";
    }
    case "council": {
      return "Neighborhood Council";
    }
    case "address":
    default:
      return "Place (Radius)";
  }
};

export default function GeocoderResult({
  children,
  ...props
}: GeocoderResultProps) {
  const { feature, onClick } = props;

  return (
    <SearchSuggestion onClick={onClick}>
      <p className="paragraph-2 line-clamp-1 text-ellipsis">{children}</p>
      <Tag color={TagColor.violet}>{getTag(feature)}</Tag>
    </SearchSuggestion>
  );
}
