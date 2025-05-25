import _ from "lodash";
import type { Nil, onEvent } from "@lucky-parking/types";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { SearchInput } from "@lucky-parking/ui/search-input";
import { actions } from "@/shared/data/store/ui-slice";
import type { GeocodeResult } from "@/shared/lib/types";
import { fetchForwardGeocodingData } from "../api";
import type { PlaceType } from "../lib/constants";
import { forwardGeocodeNeighborhoodCouncil } from "../lib/utilities";
import GeocoderResult from "./geocoder-result";
import GeocoderResultHeader from "./geocoder-result-header";

const DEFAULT_PLACEHOLDER = "Neighborhood Council, Zip Code, Address";

interface GeocoderProps {
  id?: string;
  filters?: PlaceType[] | Nil;
  isDisabled?: boolean;
  onSelect: onEvent;
  placeholder?: string;
  savedQuery?: string | Nil;
  onClearRegion?: onEvent;
}

export default function Geocoder(props: GeocoderProps) {
  const {
    id,
    filters = [],
    isDisabled = false,
    onSelect,
    placeholder = DEFAULT_PLACEHOLDER,
    savedQuery,
    onClearRegion,
  } = props;

  const dispatch = useDispatch();

  const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
  const [query, setQuery] = useState(savedQuery || "");
  const [results, setResults] = useState<GeocodeResult[]>([]);

  const hasSavedQuery = useMemo(() => savedQuery !== null, [savedQuery]);
  const hasQuery = useMemo(() => query && !_.isEmpty(query), [query]);
  const hasResults = useMemo(() => results && !_.isEmpty(results), [results]);

  const onInputChange = (value: string) => {
    if (value === "" && onClearRegion) {
      onClearRegion({ id: id, value: value });
    }
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

      if (hasSavedQuery) {
        onSuggestionClick(results[0]);
      }
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
