import { useQuery } from "@tanstack/react-query";
import { bbox, center } from "@turf/turf";
import neighborhoodCouncilCollection from "data/los-angeles-neighborhood-councils.json";
import cityCollection from "data/los-angeles.json";
import _ from "lodash";
import { usePublicConfig } from "@/hooks/use-public-config";
import { GeocoderResult, NeighborhoodCouncilFeature } from "@/types";
import { useStore } from "./use-store";

const ENGLISH_LANGUAGE_CODE = "en";
const MAPBOX_API_URL = "https://api.mapbox.com";
const MAPBOX_GEOCODING_VERSION = "v6";
const MAX_RESULTS_LIMIT = 5;
const QUERY_MIN_LENGTH = 3;
const US_COUNTRY_CODE = "US";

export const useGeocoder = () => {
	const { data } = usePublicConfig();
	const query = useStore((state) => state.query);

	const isValidQuery = query.length >= QUERY_MIN_LENGTH;

	const forwardNeighborhoodCouncils = () => {
		return _.chain(neighborhoodCouncilCollection.features as NeighborhoodCouncilFeature[])
			.filter((feature) => _.includes(_.toLower(feature.properties.NAME), _.toLower(query)))
			.map((feature) => {
				const name = feature.properties.NAME;
				return {
					...feature,
					id: `los-angeles-nc-${feature.properties.NC_ID}`,
					properties: {
						...feature.properties,
						feature_type: "neighborhood council",
						name,
						name_preferred: name,
						place_formatted: name,
						full_address: name,
						bbox: bbox(feature.geometry),
						center: center(feature.geometry),
					},
				};
			})
			.value();
	};

	return useQuery({
		enabled: isValidQuery,
		queryKey: ["geocoder", query],
		queryFn: async () => {
			if (!(isValidQuery && data?.mapboxAccessToken)) return [];

			const neighborhoodCouncils = forwardNeighborhoodCouncils();
			if (neighborhoodCouncils.length >= MAX_RESULTS_LIMIT) return _.slice(neighborhoodCouncils, 0, MAX_RESULTS_LIMIT);

			const parameters = new URLSearchParams({
				q: query,
				access_token: data.mapboxAccessToken,
				autocomplete: String(true),
				bbox: _.get(cityCollection, "features[0].bbox").join(","),
				country: US_COUNTRY_CODE,
				format: "geojson",
				language: ENGLISH_LANGUAGE_CODE.toString(),
				limit: MAX_RESULTS_LIMIT.toString(),
				permanent: String(false),
				types: "address,neighborhood,postcode", // TODO: Determine handling for address and postcode
			});

			const response = await fetch(
				`${MAPBOX_API_URL}/search/geocode/${MAPBOX_GEOCODING_VERSION}/forward?${parameters}`
			);
			const body = response.ok ? await response.json() : [];

			return _.slice([...neighborhoodCouncils, ...body.features], 0, MAX_RESULTS_LIMIT) as GeocoderResult[];
		},
		staleTime: 30_000, // 30 seconds
	});
};
