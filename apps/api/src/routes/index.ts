import citationRouter from "./citations";
import { Router } from "express";

const router: Router = Router();

router.get("/", (req, res) => void res.send("Hello World!"));
router.use("/citations", citationRouter);

export default router;
