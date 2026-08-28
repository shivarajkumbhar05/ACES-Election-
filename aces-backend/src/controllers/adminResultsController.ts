import { Request, Response } from "express";
import Election from "../models/Election";
import { asyncHandler } from "../middleware/errorHandler";
import { ok, ApiError } from "../utils/apiResponse";
import { computeResults, computeSummary, generateResultHash } from "../services/resultService";

export const getResults = asyncHandler(async (req: Request, res: Response) => {
  const { electionId } = req.query as { electionId?: string };
  const election = electionId ? await Election.findById(electionId) : await Election.findOne().sort({ createdAt: -1 });
  if (!election) throw new ApiError("Election not found.", 404);

  if (election.status !== "ENDED" && election.status !== "RESULTS_PUBLISHED") {
    // Admins may still preview participation, but candidate-level results stay hidden
    // for everyone (including this endpoint) until the election is formally ended.
    throw new ApiError("Results are only available after the election has ended.", 403);
  }

  const summary = await computeSummary(String(election._id));
  const results = await computeResults(String(election._id));

  return ok(res, {
    election: { id: election._id, name: election.name, status: election.status },
    summary: {
      eligibleStudents: summary.eligibleStudents,
      votesCast: summary.votesCast,
      participationPercent: summary.participationPercent,
      validVotes: summary.votesCast,
      invalidVotes: 0,
    },
    positions: results,
  });
});

export const publishResults = asyncHandler(async (req: Request, res: Response) => {
  const { electionId } = req.body as { electionId?: string };
  const election = electionId ? await Election.findById(electionId) : await Election.findOne().sort({ createdAt: -1 });
  if (!election) throw new ApiError("Election not found.", 404);
  if (election.status !== "ENDED") throw new ApiError("Election must be ended before results can be published.", 409);

  const hash = await generateResultHash(String(election._id));
  election.status = "RESULTS_PUBLISHED";
  election.resultsPublished = true;
  election.resultHash = hash;
  await election.save();

  return ok(res, { election, resultHash: hash });
});
