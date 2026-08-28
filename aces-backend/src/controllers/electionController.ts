import { Request, Response } from "express";
import Election from "../models/Election";
import { asyncHandler } from "../middleware/errorHandler";
import { ok, fail } from "../utils/apiResponse";
import { computeResults } from "../services/resultService";

export const getCurrentElection = asyncHandler(async (req: Request, res: Response) => {
  const election = await Election.findOne().sort({ createdAt: -1 });
  if (!election) return fail(res, "No election configured yet.", 404);

  return ok(res, {
    id: election._id,
    name: election.name,
    department: election.department,
    status: election.status,
    startAt: election.startAt,
    endAt: election.endAt,
  });
});

export const getPublishedResults = asyncHandler(async (req: Request, res: Response) => {
  const election = await Election.findOne({ status: "RESULTS_PUBLISHED" }).sort({ createdAt: -1 });
  if (!election) return fail(res, "Results have not been published yet.", 404);
  return ok(res, {
    election: { id: election._id, name: election.name, department: election.department },
    positions: await computeResults(String(election._id)),
  });
});
