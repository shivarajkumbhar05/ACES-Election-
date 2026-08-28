import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { ok } from "../utils/apiResponse";
import { validateTokenSchema, submitBallotSchema } from "../validators/votingValidators";
import * as voteService from "../services/voteService";
import { verifyVotingSession } from "../utils/votingSession";

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
  const header = req.headers.authorization;
  const session = header?.startsWith("Bearer ")
    ? verifyVotingSession(header.slice("Bearer ".length))
    : { electionId: String(election._id) };
  const result = await voteService.submitBallot(session, selections);
  return ok(res, { message: "Vote recorded successfully.", ballotId: result.ballotId, submittedAt: result.submittedAt });
});
