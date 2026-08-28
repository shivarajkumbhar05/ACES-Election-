import { Router } from "express";
import Candidate from "../models/Candidate";
import { asyncHandler } from "../middleware/errorHandler";
import { ok } from "../utils/apiResponse";

const router = Router();

// Public read-only listing of active candidates (used outside the voting flow, e.g. info pages).
// Does NOT expose vote counts.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const candidates = await Candidate.find({ status: "ACTIVE" })
      .select("name className positionId photoUrl symbolUrl")
      .populate("positionId", "name category order");
    return ok(res, candidates);
  })
);

export default router;
