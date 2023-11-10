import { Request, Response } from "express";
import { CitationService } from "../services";

export const listCitations = async (req: Request, res: Response) => {
  const { dates, geometry } = req.body;
  const citations = await CitationService.findCitations({ dates, geometry });

  res.status(200).json({
    data: citations,
  });
};

export default {
  listCitations,
};
