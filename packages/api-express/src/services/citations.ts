import { CitationFilters } from "../utilities/types";

// STUB
const findCitations = async (filters: CitationFilters) => {
  const { dates, geometry } = filters;
  console.debug("Finding citations", dates, geometry);

  return [];
};

export default {
  findCitations,
};
