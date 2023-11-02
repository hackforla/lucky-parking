import citationService from "../services/citations";

// STUB
const listCitations = async (req, res) => {
  console.debug("Request received to list citations");

  const citations = await citationService.findCitations();

  res.json({
    data: citations,
  });
};

export default {
  listCitations,
};
