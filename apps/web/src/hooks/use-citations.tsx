import { useQuery } from "@tanstack/react-query";
import { multiPolygon } from "@turf/turf";
import _ from "lodash";
import { type GeoJSONGeometry, stringify } from "wellknown";
import { usePublicConfig } from "@/hooks/use-public-config";
import { ParkingCitationFeatureCollection, ParkingCitationProperties } from "@/types";
import { useStore } from "./use-store";

const GEO_LOCATION_COLUMN = "geocodelocation";
const ISSUE_DATE_COLUMN = "issue_date";

const EMPTY_PARKING_CITATION_FEATURE_COLLECTION = {
	type: "FeatureCollection",
	features: [] satisfies ParkingCitationProperties[],
} satisfies ParkingCitationFeatureCollection;

export const useCitations = () => {
	const { data } = usePublicConfig();
	const { places, range } = useStore((state) => ({ places: state.getPlaces(), range: state.range }));

	const placeIds = _.chain(places).map("id").compact().uniq().sort().value();

	const buildQuery = () => {
		const startDate = range.from.toISOString().split("T")[0];
		const endDate = range.to.toISOString().split("T")[0];
		const dateFilter = `${ISSUE_DATE_COLUMN} BETWEEN '${startDate}' AND '${endDate}'`;

		if (!placeIds.length) return `SELECT * WHERE ${dateFilter}`;

		const coordinates = _.chain(places).map("geometry.coordinates").compact().value();
		const multipolygon = multiPolygon(coordinates);
		const wkt = stringify(multipolygon.geometry as GeoJSONGeometry);
		const geoFilter = `within_polygon(${GEO_LOCATION_COLUMN}, '${wkt}')`;
		return `SELECT * WHERE ${dateFilter} AND ${geoFilter}`;
	};

	return useQuery({
		queryKey: ["citations", range.from.toISOString(), range.to.toISOString(), placeIds],
		queryFn: async (): Promise<ParkingCitationFeatureCollection> => {
			if (!(placeIds.length && data?.socrataAppToken)) return EMPTY_PARKING_CITATION_FEATURE_COLLECTION;

			const response = await fetch("https://data.lacity.org/api/v3/views/4f5p-udkv/query", {
				method: "POST",
				headers: {
					Accept: "application/vnd.geo+json",
					"Accept-Charset": "utf-8",
					"Content-Type": "application/json",
					"X-App-Token": data.socrataAppToken,
				},
				// FIXME: Remove limit (pagination) when implementing full data fetching
				body: JSON.stringify({ query: buildQuery(), page: { pageNumber: 1, pageSize: 50 } }),
			});

			return response.ok ? response.json() : EMPTY_PARKING_CITATION_FEATURE_COLLECTION;
		},
		staleTime: 60_000, // 1 minute
	});
};
