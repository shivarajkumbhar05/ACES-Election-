import api from "./client";

// GET /api/positions
export async function listPositions() {
  const { data } = await api.get("/positions");
  return data.data;
}
