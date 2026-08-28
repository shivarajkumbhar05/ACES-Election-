import api from "./client";

// GET /api/elections/current
export async function getCurrentElection() {
  const { data } = await api.get("/elections/current");
  return data.data;
}

export async function getPublishedResults() {
  const { data } = await api.get("/elections/published-results");
  return data.data;
}
