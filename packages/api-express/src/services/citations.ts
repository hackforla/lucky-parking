import { db } from "../database";
import { CitationFilters } from "../utilities/types";

// STUB
const findCitations = async (filters: CitationFilters) => {
  const { dates, geometry } = filters;

  const query = {
    $and: [
      {
        dates: {
          $gte: dates[0],
          $lte: dates[1],
        },
      },
      { geometry },
    ],
  };
  try {
    const collection = db.collection("citations");
    return await collection.find(query).toArray();
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export default {
  findCitations,
};
