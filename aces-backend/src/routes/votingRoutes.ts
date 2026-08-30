import { Router } from "express";
import { validateToken, getCandidates, submitVote } from "../controllers/votingController";
import { votingLimiter } from "../middleware/rateLimit";
import { requireVotingSession } from "../middleware/auth";

const router = Router();

router.post("/validate-token", votingLimiter, validateToken);
router.get("/candidates", getCandidates);
router.post("/submit", votingLimiter, requireVotingSession, submitVote);

export default router;
