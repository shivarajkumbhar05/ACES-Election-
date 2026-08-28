import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface VotingSessionPayload {
  electionId: string;
  voterTokenId: string;
  type: "voting_session";
}

/**
 * Short-lived, anonymous voting session issued after a one-time token is validated.
 * It intentionally carries NO student identity - only the election and the (already
 * consumed-at-submit-time) voter token reference - so the vote itself remains anonymous.
 */
export function issueVotingSession(payload: Omit<VotingSessionPayload, "type">): string {
  return jwt.sign({ ...payload, type: "voting_session" }, env.VOTING_SESSION_SECRET, {
    expiresIn: `${env.VOTING_SESSION_TTL_MINUTES}m`,
  });
}

export function verifyVotingSession(token: string): VotingSessionPayload {
  const decoded = jwt.verify(token, env.VOTING_SESSION_SECRET) as VotingSessionPayload;
  if (decoded.type !== "voting_session") throw new Error("Invalid session type");
  return decoded;
}
