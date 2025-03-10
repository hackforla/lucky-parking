import { SearchSuggestionHeader } from "@lucky-parking/ui/search-input";

export default function GeocoderResultHeader() {
  return (
    <SearchSuggestionHeader>
      <p className="text-[12px] font-semibold leading-[140%]">Location Result</p>
      <p className="text-[12px] font-semibold leading-[140%]">Region Type</p>
    </SearchSuggestionHeader>
  );
}
