import { Router } from "express";
import citationRouter from "./citations";

const router = Router();

router.get("/", (req, res) => res.send("Hello World!"));
router.use("/citations", citationRouter);

export default router;
