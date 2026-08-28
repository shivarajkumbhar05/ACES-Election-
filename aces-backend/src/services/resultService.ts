import Position from "../models/Position";
import Candidate from "../models/Candidate";
import Vote from "../models/Vote";
import VoterToken from "../models/VoterToken";
import Ballot from "../models/Ballot";
import Election from "../models/Election";
import { sha256Json } from "../utils/hash";

export interface CandidateResult {
  candidateId: string;
  name: string;
  className: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
  isTied: boolean;
}

export interface PositionResult {
  positionId: string;
  positionName: string;
  category: string;
  totalVotes: number;
  candidates: CandidateResult[];
  tie: boolean;
}

export async function computeResults(electionId: string) {
  const positions = await Position.find({ active: true }).sort({ order: 1 }).lean();
  const candidates = await Candidate.find().lean();
  const voteCounts = await Vote.aggregate([
    { $match: { electionId: new (require("mongoose").Types.ObjectId)(electionId) } },
    { $group: { _id: { positionId: "$positionId", candidateId: "$candidateId" }, count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  for (const row of voteCounts) {
    countMap.set(`${row._id.positionId}:${row._id.candidateId}`, row.count);
  }

  const positionResults: PositionResult[] = positions.map((pos) => {
    const posCandidates = candidates.filter((c) => String(c.positionId) === String(pos._id));
    const rows = posCandidates.map((c) => ({
      candidateId: String(c._id),
      name: c.name,
      className: c.className,
      votes: countMap.get(`${pos._id}:${c._id}`) || 0,
    }));
    const totalVotes = rows.reduce((sum, r) => sum + r.votes, 0);
    const maxVotes = rows.length ? Math.max(...rows.map((r) => r.votes)) : 0;
    const topCandidates = rows.filter((r) => r.votes === maxVotes && maxVotes > 0);
    const tie = topCandidates.length > 1;

    const candidateResults: CandidateResult[] = rows
      .map((r) => ({
        candidateId: r.candidateId,
        name: r.name,
        className: r.className,
        votes: r.votes,
        percentage: totalVotes > 0 ? Math.round((r.votes / totalVotes) * 10000) / 100 : 0,
        isWinner: !tie && r.votes === maxVotes && maxVotes > 0,
        isTied: tie && r.votes === maxVotes,
      }))
      .sort((a, b) => b.votes - a.votes);

    return {
      positionId: String(pos._id),
      positionName: pos.name,
      category: pos.category,
      totalVotes,
      candidates: candidateResults,
      tie,
    };
  });

  return positionResults;
}

export async function computeSummary(electionId: string) {
  const election = await Election.findById(electionId).lean();
  const eligibleStudents = await VoterToken.countDocuments({ electionId });
  const votesCast = await Ballot.countDocuments({ electionId });
  const remaining = Math.max(eligibleStudents - votesCast, 0);
  const participation = eligibleStudents > 0 ? Math.round((votesCast / eligibleStudents) * 10000) / 100 : 0;

  return {
    election,
    eligibleStudents,
    votesCast,
    remaining,
    participationPercent: participation,
  };
}

export async function generateResultHash(electionId: string) {
  const results = await computeResults(electionId);
  const summary = await computeSummary(electionId);
  return sha256Json({
    electionId,
    votesCast: summary.votesCast,
    eligibleStudents: summary.eligibleStudents,
    results,
  });
}
