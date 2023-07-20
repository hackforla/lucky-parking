import _, { result } from "lodash";
import { useEffect, useState } from "react";
import { Result as IGeocoderResult } from "mapbox__mapbox-gl-geocoder";
import SearchInput from "@lucky-parking/ui/src/components/search-input";
import { fetchGeocodingData } from "./api/mapbox";
import GeocoderResult from "./geocoder-result";
import GeocoderResultHeader from "./geocoder-result-header";
import NeighborhoodCouncils from "../../data/geo/los-angeles-neighborhood-councils.json"

const SEARCH_PLACEHOLDER = "Neighborhood Council, Zip Code, Address";

interface GeocoderProps {
  onSelect?: (args: any) => void;
}
interface NeighborhoodCouncilData {
    type: string,
    geometry: {
      type: string,
      coordinates: Array<Array<object>>
    },
    place_name?: string,
    place_type?: object,
    properties: {
      [key: string]: any
    },
    center?: object
}

const neighborCouncilData: Array<NeighborhoodCouncilData> = NeighborhoodCouncils.features

function titleCaseCouncilName(councilName: string) {
  let ncAcronym = councilName.split(' ').slice(-1);
  let council = councilName.toLowerCase().split(' ').slice(0,-1);
  return council.map(name => {
    return name.replace(name[0], name[0].toUpperCase());
  }).join(' ') + ` ${ncAcronym}`;
}

export function nbcouncilForwardGeocoder(query: string) {
  const matchingFeatures = [];
  for (const feature of neighborCouncilData) {
    if (
    feature.properties['NAME']
    .toLowerCase()
    .includes(query.toLowerCase())
    ) {
    feature['place_name'] = titleCaseCouncilName(feature.properties['NAME']);
    feature['center'] = feature.geometry.coordinates[0][0];
    feature['place_type'] = ['neighborhoodCouncil'];
    matchingFeatures.push(feature);
    break;
    }
  }
  return matchingFeatures;
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
      let { features } = await fetchGeocodingData(query);
      if (nbcouncilForwardGeocoder(query).length && features.length >= 5) {
        features = [...nbcouncilForwardGeocoder(query), ...features.slice(1)]
      }
      if (nbcouncilForwardGeocoder(query).length && features.length < 5) {
        features = [...nbcouncilForwardGeocoder(query), ...features]
      }
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