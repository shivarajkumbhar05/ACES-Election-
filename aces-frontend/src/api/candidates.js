import api from "./client";

// GET /api/candidates — public, read-only, no vote counts
export async function listPublicCandidates() {
  const { data } = await api.get("/candidates");
  return data.data;
}
