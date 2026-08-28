import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  BarChart3,
  Power,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/candidates", label: "Manage Candidates", icon: Users },
  { to: "/admin/positions", label: "Add Post", icon: BriefcaseBusiness },
  { to: "/admin/results", label: "Results", icon: BarChart3 },
  { to: "/admin/end-election", label: "End Election", icon: Power },
];

export default function AdminLayout() {
  const { isAuthenticated, admin, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f3f1fb]">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-aces-purple-900 px-4 py-3 text-white lg:hidden">
        <span className="font-display text-sm font-bold">ACES Admin</span>
        <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-aces-purple-900 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aces-gold-400 text-aces-purple-900 font-display font-extrabold">
            A
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-none">ACES Admin</p>
            <p className="mt-1 text-[11px] text-aces-purple-300">Control Panel</p>
          </div>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-aces-gold-400 text-aces-purple-900"
                    : "text-aces-purple-100 hover:bg-white/10"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-4">
          <p className="truncate text-xs text-aces-purple-300">Signed in as</p>
          <p className="truncate text-sm font-semibold">{admin?.username || "Administrator"}</p>
          <p className="text-[11px] text-aces-purple-300">{admin?.role?.replaceAll("_", " ")}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-aces-purple-100 hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-10 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="flex-1 pt-16 lg:pt-0">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
