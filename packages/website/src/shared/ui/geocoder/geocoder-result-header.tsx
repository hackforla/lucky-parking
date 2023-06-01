import { SearchSuggestionHeader } from "@lucky-parking/ui/src/components/search-input";

export default function GeocoderResultHeader() {
  return (
    <SearchSuggestionHeader>
      <p className="font-semibold text-[12px] leading-[140%]">
        Location Result
      </p>
      <p className="font-semibold text-[12px] leading-[140%]">Region Type</p>
    </SearchSuggestionHeader>
  );
}
