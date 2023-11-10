import { Router } from "express";
import { z } from "zod";
import { CitationController } from "../controllers";
import validate from "../middleware/validator";
import * as schemas from "../utilities/schemas";

const ListCitationRequestSchema = z.object({ body: schemas.CitationFiltersSchema });

const citationRouter = Router();

citationRouter.post("/", validate(ListCitationRequestSchema), CitationController.listCitations);

export default citationRouter;
