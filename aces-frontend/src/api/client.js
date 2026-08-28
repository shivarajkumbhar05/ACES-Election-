import axios from "axios";

// Base URL for the ACES Election backend API.
// Configure via .env → VITE_API_URL. Same-origin /api is proxied during local development.
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the anonymous voting-session token (issued after token validation)
// and/or the admin JWT automatically, whichever is present.
api.interceptors.request.use((config) => {
  const votingSessionToken = sessionStorage.getItem("aces_voting_session");
  const adminToken = localStorage.getItem("aces_admin_token");

  if (config.url?.includes("/voting/") && votingSessionToken && votingSessionToken !== "direct-voting") {
    config.headers.Authorization = `Bearer ${votingSessionToken}`;
  } else if (config.url?.includes("/admin/") && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Normalize error handling: every backend error follows { success: false, message }.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
