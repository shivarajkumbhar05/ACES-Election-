import mongoose from "mongoose";
import Election from "../models/Election";
import Position from "../models/Position";
import Candidate from "../models/Candidate";
import VoterToken from "../models/VoterToken";
import Ballot from "../models/Ballot";
import Vote from "../models/Vote";
import { ApiError } from "../utils/apiResponse";
import { hashToken, normalizeToken, tokenPreview } from "../utils/token";
import { sha256Json } from "../utils/hash";
import { issueVotingSession, VotingSessionPayload } from "../utils/votingSession";

/**
 * Validates a one-time voting token and, if valid, issues a short-lived anonymous
 * voting session. Does NOT mark the token as used - that only happens atomically
 * at ballot submission time, inside the same transaction as vote creation.
 */
export async function validateVoterToken(rawToken: string) {
  const election = await Election.findOne({ status: "LIVE" });
  if (!election) {
    throw new ApiError("Voting is not currently open.", 403);
  }

  const tokenHash = hashToken(rawToken);
  const voterToken = await VoterToken.findOne({ tokenHash, electionId: election._id });

  if (!voterToken) {
    throw new ApiError("Invalid voting token.", 400);
  }
  if (voterToken.status === "USED") {
    throw new ApiError("This voting token has already been used.", 403);
  }
  if (voterToken.status === "REVOKED") {
    throw new ApiError("This voting token has been revoked. Please contact the ACES Coordinator.", 403);
  }

  // Defensive re-check: a ballot might already exist even if status update lagged.
  const existingBallot = await Ballot.findOne({ electionId: election._id, voterTokenId: voterToken._id });
  if (existingBallot) {
    throw new ApiError("This voting token has already been used.", 403);
  }

  const sessionToken = issueVotingSession({
    electionId: String(election._id),
    voterTokenId: String(voterToken._id),
  });

  return { sessionToken, electionId: String(election._id) };
}

export async function getLiveElection() {
  const election = await Election.findOne({ status: "LIVE" });
  if (!election) throw new ApiError("Voting is not currently open.", 403);
  return election;
}

export async function getBallotCandidates(electionId: string) {
  const election = await Election.findById(electionId);
  if (!election || election.status !== "LIVE") {
    throw new ApiError("Voting is not currently open.", 403);
  }

  const positions = await Position.find({ active: true }).sort({ order: 1 }).lean();
  const candidates = await Candidate.find({ status: "ACTIVE" })
    .select("name enrollmentNo className positionId photoUrl symbolUrl")
    .lean();

  return positions.map((p) => ({
    position: { id: p._id, name: p.name, category: p.category, order: p.order },
    candidates: candidates
      .filter((c) => String(c.positionId) === String(p._id))
      .map((c) => ({
        id: c._id,
        name: c.name,
        className: c.className,
        photoUrl: c.photoUrl,
        symbolUrl: c.symbolUrl,
      })),
  }));
}

interface Selection {
  positionId: string;
  candidateId: string;
}

/**
 * Submits a completed ballot inside a MongoDB transaction:
 *  1. Re-validate election is LIVE
 *  2. Re-validate token is ACTIVE and unused
 *  3. Validate every active position has exactly one candidate, and that
 *     candidate genuinely belongs to that position
 *  4. Create the Ballot document (protected by the unique electionId+voterTokenId index)
 *  5. Create six Vote documents
 *  6. Mark the token USED
 *  7. Commit
 *
 * Any failure at any step rolls back the entire transaction - no partial ballot
 * can ever exist.
 */
export async function submitBallot(session: Pick<VotingSessionPayload, "electionId"> & Partial<Pick<VotingSessionPayload, "voterTokenId">>, selections: Selection[]) {
  const mongoSession = await mongoose.startSession();

  try {
    let result: { ballotId: string; submittedAt: Date } | undefined;

    await mongoSession.withTransaction(async () => {
      const election = await Election.findById(session.electionId).session(mongoSession);
      if (!election || election.status !== "LIVE") {
        throw new ApiError("Voting has ended or is not currently open.", 403);
      }

      const voterToken = session.voterTokenId
        ? await VoterToken.findById(session.voterTokenId).session(mongoSession)
        : null;
      if (session.voterTokenId && (!voterToken || String(voterToken.electionId) !== String(election._id))) {
        throw new ApiError("Invalid voting session.", 401);
      }
      if (voterToken && voterToken.status !== "ACTIVE") {
        throw new ApiError("This voting token has already been used.", 403);
      }

      const activePositions = await Position.find({ active: true }).session(mongoSession);
      if (selections.length !== activePositions.length) {
        throw new ApiError("Please select one candidate for every position.", 422);
      }

      const positionIds = new Set(activePositions.map((p) => String(p._id)));
      const selectedPositionIds = new Set(selections.map((s) => s.positionId));
      if (selectedPositionIds.size !== selections.length) {
        throw new ApiError("Duplicate position in ballot.", 422);
      }
      for (const id of selectedPositionIds) {
        if (!positionIds.has(id)) {
          throw new ApiError("Ballot contains an invalid position.", 422);
        }
      }

      const candidateIds = selections.map((s) => s.candidateId);
      const candidates = await Candidate.find({
        _id: { $in: candidateIds },
        status: "ACTIVE",
      }).session(mongoSession);

      if (candidates.length !== selections.length) {
        throw new ApiError("Ballot contains an invalid or inactive candidate.", 422);
      }

      const candidateById = new Map(candidates.map((c) => [String(c._id), c]));
      for (const sel of selections) {
        const candidate = candidateById.get(sel.candidateId);
        if (!candidate || String(candidate.positionId) !== sel.positionId) {
          throw new ApiError("A selected candidate does not belong to the specified position.", 422);
        }
      }

      const ballotHash = sha256Json({
        electionId: String(election._id),
        voterTokenId: voterToken ? String(voterToken._id) : String(new mongoose.Types.ObjectId()),
        selections: selections
          .slice()
          .sort((a, b) => a.positionId.localeCompare(b.positionId)),
        submittedAt: new Date().toISOString(),
      });

      // This insert is guarded by the unique (electionId, voterTokenId) index -
      // a concurrent duplicate submission will throw a Mongo E11000 error here
      // and the whole transaction rolls back.
      const [ballot] = await Ballot.create(
        [
          {
            electionId: election._id,
            voterTokenId: voterToken?._id || new mongoose.Types.ObjectId(),
            ballotHash,
          },
        ],
        { session: mongoSession }
      );

      await Vote.insertMany(
        selections.map((s) => ({
          ballotId: ballot._id,
          electionId: election._id,
          positionId: s.positionId,
          candidateId: s.candidateId,
        })),
        { session: mongoSession }
      );

      if (voterToken) {
        voterToken.status = "USED";
        voterToken.usedAt = new Date();
        await voterToken.save({ session: mongoSession });
      }

      result = { ballotId: String(ballot._id), submittedAt: ballot.submittedAt };
    });

    if (!result) throw new ApiError("Vote submission failed.", 500);
    return result;
  } catch (err: any) {
    if (err?.code === 11000) {
      throw new ApiError("This ballot has already been submitted.", 403);
    }
    throw err;
  } finally {
    await mongoSession.endSession();
  }
}

export { normalizeToken, tokenPreview };
