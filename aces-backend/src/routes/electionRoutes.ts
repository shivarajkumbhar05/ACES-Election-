import { Router } from "express";
import { getCurrentElection, getPublishedResults } from "../controllers/electionController";

const router = Router();
router.get("/current", getCurrentElection);
router.get("/published-results", getPublishedResults);

export default router;
