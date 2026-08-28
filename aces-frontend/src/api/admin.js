import api from "./client";

// --- Auth ---
export async function adminLogin(username, password) {
  const { data } = await api.post("/admin/login", { username, password });
  return data.data; // { token, admin }
}

// --- Dashboard ---
export async function getAdminDashboard() {
  const { data } = await api.get("/admin/dashboard");
  return data.data; // { election, stats, recentActivity }
}

export async function getAuditLogs() {
  const { data } = await api.get("/admin/audit-logs");
  return data.data;
}

// --- Election lifecycle ---
export async function createElection(payload) {
  const { data } = await api.post("/admin/election", payload);
  return data.data;
}

export async function startElection(electionId) {
  const { data } = await api.post("/admin/election/start", { electionId });
  return data.data;
}

export async function stopElection(electionId) {
  const { data } = await api.post("/admin/election/stop", { electionId });
  return data.data;
}

export async function rescheduleElection(electionId, startAt, endAt) {
  const { data } = await api.patch("/admin/election/reschedule", { electionId, startAt, endAt });
  return data.data;
}

export async function listAdminPositions() {
  const { data } = await api.get("/admin/positions");
  return data.data;
}

export async function createPosition(payload) {
  const { data } = await api.post("/admin/positions", payload);
  return data.data;
}

export async function updatePosition(id, payload) {
  const { data } = await api.put(`/admin/positions/${id}`, payload);
  return data.data;
}

export async function deletePosition(id) {
  const { data } = await api.delete(`/admin/positions/${id}`);
  return data.data;
}

export async function endElection(electionId, password) {
  const { data } = await api.post("/admin/election/end", { electionId, password });
  return data.data;
}

// --- Candidates ---
export async function listAdminCandidates() {
  const { data } = await api.get("/admin/candidates");
  return data.data;
}

export async function createCandidate(formData) {
  const { data } = await api.post("/admin/candidates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateCandidate(id, formData) {
  const { data } = await api.put(`/admin/candidates/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function deleteCandidate(id) {
  const { data } = await api.delete(`/admin/candidates/${id}`);
  return data.data;
}

export async function setCandidateStatus(id, status) {
  const { data } = await api.patch(`/admin/candidates/${id}/status`, { status });
  return data.data;
}

// --- Voter tokens ---
export async function generateTokens(electionId, count) {
  const { data } = await api.post("/admin/tokens/generate", { electionId, count });
  return data.data; // { count, tokens: [raw...] }
}

export async function importTokens(electionId, count) {
  const { data } = await api.post("/admin/tokens/import", { electionId, count });
  return data.data;
}

export async function listTokens(params = {}) {
  const { data } = await api.get("/admin/tokens", { params });
  return data.data;
}

export async function revokeToken(tokenId) {
  const { data } = await api.post("/admin/tokens/revoke", { tokenId });
  return data.data;
}

export function exportUnusedTokensUrl(electionId) {
  const base = api.defaults.baseURL;
  return `${base}/admin/tokens/export${electionId ? `?electionId=${electionId}` : ""}`;
}

export async function generateTokenQr(token) {
  const { data } = await api.post("/admin/tokens/qr", { token });
  return data.data; // { qrCode: dataUrl }
}

// --- Results & reports ---
export async function getResults(electionId) {
  const { data } = await api.get("/admin/results", { params: electionId ? { electionId } : {} });
  return data.data;
}

export async function publishResults(electionId) {
  const { data } = await api.post("/admin/results/publish", { electionId });
  return data.data;
}

export async function downloadExport(kind, electionId) {
  // kind: "excel" | "pdf"
  const path = kind === "excel" ? "/admin/export/excel" : "/admin/export/pdf";
  const { data } = await api.get(path, {
    params: electionId ? { electionId } : {},
    responseType: "blob",
  });
  const filename = kind === "excel" ? "aces-election-results.xlsx" : "aces-election-results.pdf";
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
