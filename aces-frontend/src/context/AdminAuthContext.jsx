import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminLogin as apiAdminLogin } from "../api/admin";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("aces_admin_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("aces_admin_user");
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        /* ignore corrupt cache */
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const { token: newToken, admin: adminData } = await apiAdminLogin(username, password);
    localStorage.setItem("aces_admin_token", newToken);
    localStorage.setItem("aces_admin_user", JSON.stringify(adminData));
    setToken(newToken);
    setAdmin(adminData);
    return adminData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("aces_admin_token");
    localStorage.removeItem("aces_admin_user");
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ admin, token, isAuthenticated: !!token, loading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
