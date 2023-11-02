import { Router } from "express";
import citationController from "../controllers/citations";

const router = Router();

router.post("/", citationController.listCitations);

export default router;
