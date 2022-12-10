/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { its5Route, susRoute } from "./routes/misc";

const router = Router();

// It's 5!
router.route("/its5").all(its5Route);

// Nothing
router.route("/").all(susRoute);

export default router;
