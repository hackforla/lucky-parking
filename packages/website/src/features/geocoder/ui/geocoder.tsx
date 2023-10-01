import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import SearchInput from "@lucky-parking/ui/src/components/search-input";
import { actions } from "@/shared/data/store/ui-slice";
import type { GeocodeResult, Nil, onEvent } from "@/shared/lib/types";
import { fetchForwardGeocodingData } from "../api";
import type { PlaceType } from "../lib/constants";
import { forwardGeocodeNeighborhoodCouncil } from "../lib/utilities";
import GeocoderResult from "./geocoder-result";
import GeocoderResultHeader from "./geocoder-result-header";

const DEFAULT_PLACEHOLDER = "Neighborhood Council, Zip Code, Address";

interface GeocoderProps {
  filters?: PlaceType[] | Nil;
  isDisabled?: boolean;
  onSelect: onEvent;
  placeholder?: string;
}

export default function Geocoder(props: GeocoderProps) {
  const { filters = [], isDisabled = false, onSelect, placeholder = DEFAULT_PLACEHOLDER } = props;

  const dispatch = useDispatch();

  const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);

  const hasQuery = useMemo(() => query && !_.isEmpty(query), [query]);
  const hasResults = useMemo(() => results && !_.isEmpty(results), [results]);

  const onInputChange = (value: string) => {
    setQuery(value);
    setSuggestionsVisible(true);
  };

  const onSuggestionClick = (result: GeocodeResult) => {
    setQuery(result.place_name);
    setSuggestionsVisible(false);
    setResults([]);
    onSelect(result);

    dispatch(actions.setMapFocusedFeature(result));
  };

  useEffect(() => {
    if (!hasQuery || _.size(query) < 2) {
      setQuery(query);
      setResults([]);
      onSelect(null);

      dispatch(actions.setMapFocusedFeature(null));
    }

    (async () => {
      if (!hasQuery) return;

      const sanitizedQuery = _.replace(query, /[.]/gi, "");
      const { features } = await fetchForwardGeocodingData(sanitizedQuery);
      const councils = forwardGeocodeNeighborhoodCouncil(sanitizedQuery);

      const results = _.chain([...councils, ...features])
        .filter((value) => _.isEmpty(filters) || !_.isEmpty(_.intersection(filters, value.place_type)))
        .slice(0, 5)
        .value();
      setResults(results);
    })();
  }, [query]);

  return (
    <SearchInput value={query} placeholder={placeholder} onChange={onInputChange} isDisabled={isDisabled}>
      {isSuggestionsVisible && hasResults && (
        <>
          <GeocoderResultHeader />
          {_.map(results, (result) => (
            <GeocoderResult feature={result} key={result.place_name} onClick={() => onSuggestionClick(result)}>
              {result.place_name}
            </GeocoderResult>
          ))}
        </>
      )}
    </SearchInput>
  );
}
