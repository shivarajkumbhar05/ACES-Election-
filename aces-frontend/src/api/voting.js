import api from "./client";

// POST /api/voting/validate-token → { votingSessionToken }
export async function validateVoterToken(token) {
  const { data } = await api.post("/voting/validate-token", { token });
  return data.data;
}

// GET /api/voting/candidates → [{ position, candidates }]  (requires session token)
export async function getBallotCandidates() {
  const { data } = await api.get("/voting/candidates");
  return data.data;
}

// POST /api/voting/submit → { message, ballotId, submittedAt }
export async function submitBallot(selections) {
  const { data } = await api.post("/voting/submit", { selections });
  return data.data;
}
