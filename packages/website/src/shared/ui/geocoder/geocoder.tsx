import _ from "lodash";
import { useEffect, useState } from "react";
import { Result as IGeocoderResult } from "mapbox__mapbox-gl-geocoder";
import SearchInput from "@lucky-parking/ui/src/components/search-input";
import { fetchGeocodingData } from "./api/mapbox";
import GeocoderResult from "./geocoder-result";
import GeocoderResultHeader from "./geocoder-result-header";

const SEARCH_PLACEHOLDER = "Neighborhood Council, Zip Code, Address";

interface GeocoderProps {
  onSelect?: (args: any) => void;
}

export default function Geocoder(props: GeocoderProps) {
  const { onSelect = _.noop } = props;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const hasQuery = query && !_.isEmpty(query);
  const hasResults = results && !_.isEmpty(results);

  const onSuggestionClick = (result: IGeocoderResult) => {
    setQuery(result.place_name);
    setResults([]);
    onSelect(result);
  };

  useEffect(() => {
    if (!hasQuery || _.size(query) < 2) {
      setQuery(query);
      setResults([]);
    }

    (async () => {
      if (!hasQuery) return;
      const { features } = await fetchGeocodingData(query);
      setResults(features || []);
    })();
  }, [query]);

  return (
    <SearchInput
      value={query}
      placeholder={SEARCH_PLACEHOLDER}
      onChange={setQuery}
    >
      {hasResults && <GeocoderResultHeader />}
      {_.map(results, (result: IGeocoderResult) => (
        <GeocoderResult
          feature={result}
          key={result.place_name}
          onClick={() => onSuggestionClick(result)}
        >
          {result.place_name}
        </GeocoderResult>
      ))}
    </SearchInput>
  );
}