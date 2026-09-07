import _ from "lodash";
import { getDb } from "@/database";
import { CitationFilters } from "@/utilities/types";

const { COL_CITATIONS } = process.env;

const findCitations = async (filters: CitationFilters) => {
	const { dates, geometry } = filters;

	const datesExpr = _.isNil(dates) || _.isEmpty(dates) ? {} : { issue_date: { $gte: dates[0], $lte: dates[1] } };

	const geometryExpr =
		_.isNil(geometry) || _.isEmpty(geometry) ? {} : { geometry: { $geoWithin: { $geometry: geometry } } };

	const query = {
		$and: [datesExpr, geometryExpr, { "geometry.coordinates": { $nin: [null] } }],
	};

	try {
		const collection = getDb().collection(COL_CITATIONS as string);
		return await collection.find(query).toArray();
	} catch (error) {
		if (error instanceof Error) throw new Error(error.message);
	}
};

export default {
	findCitations,
};
