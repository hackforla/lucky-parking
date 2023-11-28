import { Request, Response } from "express";
import { CitationService } from "../services";

export const listCitations = async (req: Request, res: Response) => {
  const { dates, geometry } = req.body;
  const citations = await CitationService.findCitations({ dates, geometry });

  const headers = {
    "X-Total-Count": citations.length,
  };

  res.status(200).set(headers).json({
    data: citations,
  });
};

export default {
  listCitations,
};
