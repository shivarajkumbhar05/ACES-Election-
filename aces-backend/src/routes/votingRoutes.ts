import { Router } from "express";
import { validateToken, getCandidates, submitVote } from "../controllers/votingController";
import { votingLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/validate-token", votingLimiter, validateToken);
router.get("/candidates", getCandidates);
router.post("/submit", votingLimiter, submitVote);

export default router;
