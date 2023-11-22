import { db } from "../database";
import { CitationFilters } from "../utilities/types";

const { COL_NAME_CITATIONS } = process.env;

const findCitations = async (filters: CitationFilters) => {
  const { dates, geometry } = filters;

  const query = {
    $and: [{ issue_date: { $gte: dates[0], $lte: dates[1] } }, { geometry: { $geoWithin: { $geometry: geometry } } }],
  };

  try {
    const collection = db.collection(COL_NAME_CITATIONS as string);
    return await collection.find(query).toArray();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export default {
  findCitations,
};
