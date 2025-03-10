import { Router } from "express";
import citationRouter from "./citations";

const router: Router = Router();

router.get("/", (req, res) => void res.send("Hello World!"));
router.use("/citations", citationRouter);

export default router;
