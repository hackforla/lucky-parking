import { Router } from "express";
import citationRoutes from "./citations";

const router = Router();

router.get("/", (req, res) => res.send("Hello World!"));
router.use("/citations", citationRoutes);

export default router;
