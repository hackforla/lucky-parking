import { multiPolygon } from "@turf/turf";
import _ from "lodash";
import { type GeoJSONGeometry, stringify } from "wellknown";
import { ParkingCitationFeatureCollection, ParkingCitationProperties } from "@/types";

type FetchParkingCitationsInput = {
	token?: string;
	places: Array<{
		id?: string | number | null;
		geometry?: {
			coordinates?: unknown;
		} | null;
	}>;
	range: {
		from: Date;
		to: Date;
	};
};

const SOCRATA_PARKING_CITATIONS_URL = "https://data.lacity.org/api/v3/views/4f5p-udkv/query";

const GEO_LOCATION_COLUMN = "geocodelocation";
const ISSUE_DATE_COLUMN = "issue_date";

const EMPTY_PARKING_CITATION_FEATURE_COLLECTION = {
	type: "FeatureCollection",
	features: [] satisfies ParkingCitationProperties[],
} satisfies ParkingCitationFeatureCollection;

const toSocrataDate = (date: Date) => date.toISOString().split("T")[0];

const buildParkingCitationsQuery = ({ places, range }: Pick<FetchParkingCitationsInput, "places" | "range">) => {
	const startDate = toSocrataDate(range.from);
	const endDate = toSocrataDate(range.to);
	const dateFilter = `${ISSUE_DATE_COLUMN} BETWEEN '${startDate}' AND '${endDate}'`;

	const placeIds = _.chain(places).map("id").compact().uniq().sort().value();

	if (!placeIds.length) {
		return `SELECT * WHERE ${dateFilter}`;
	}

	const coordinates = _.chain(places).map("geometry.coordinates").compact().value();

	const multipolygon = multiPolygon(coordinates);
	const wkt = stringify(multipolygon.geometry as GeoJSONGeometry);
	const geoFilter = `within_polygon(${GEO_LOCATION_COLUMN}, '${wkt}')`;

	return `SELECT * WHERE ${dateFilter} AND ${geoFilter}`;
};

export const fetchParkingCitations = async ({
	token,
	places,
	range,
}: FetchParkingCitationsInput): Promise<ParkingCitationFeatureCollection> => {
	const placeIds = _.chain(places).map("id").compact().uniq().sort().value();

	if (!(placeIds.length && token)) {
		return EMPTY_PARKING_CITATION_FEATURE_COLLECTION;
	}

	const response = await fetch(SOCRATA_PARKING_CITATIONS_URL, {
		method: "POST",
		headers: {
			Accept: "application/vnd.geo+json",
			"Accept-Charset": "utf-8",
			"Content-Type": "application/json",
			"X-App-Token": token,
		},
		body: JSON.stringify({
			query: buildParkingCitationsQuery({ places, range }),
			// FIXME: Remove limit (pagination) when implementing full data fetching
			page: {
				pageNumber: 1,
				pageSize: 50,
			},
		}),
	});

	if (!response.ok) {
		return EMPTY_PARKING_CITATION_FEATURE_COLLECTION;
	}

	return response.json();
};
