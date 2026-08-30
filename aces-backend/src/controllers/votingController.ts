import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { ok } from "../utils/apiResponse";
import { ApiError } from "../utils/apiResponse";
import { validateTokenSchema, submitBallotSchema } from "../validators/votingValidators";
import * as voteService from "../services/voteService";

export const validateToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = validateTokenSchema.parse(req.body);
  const result = await voteService.validateVoterToken(token);
  return ok(res, { votingSessionToken: result.sessionToken });
});

export const getCandidates = asyncHandler(async (req: Request, res: Response) => {
  const election = await voteService.getLiveElection();
  const ballot = await voteService.getBallotCandidates(String(election._id));
  return ok(res, ballot);
});

export const submitVote = asyncHandler(async (req: Request, res: Response) => {
  const { selections } = submitBallotSchema.parse(req.body);
  const election = await voteService.getLiveElection();
  
  // Voting session MUST be provided (enforced by middleware)
  if (!req.votingSession) {
    throw new Error("Voting session required but not found");
  }
  
  const result = await voteService.submitBallot(req.votingSession, selections);
  return ok(res, { message: "Vote recorded successfully.", ballotId: result.ballotId, submittedAt: result.submittedAt });
});
