import { Outlet, Link } from "react-router-dom";
import CollegeHeader from "../components/CollegeHeader";
import { ShieldCheck } from "lucide-react";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <CollegeHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-aces-purple-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-aces-purple-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ACES · Computer Engineering Department</p>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure, single-use voting tokens · Encrypted ballots</span>
          </div>
          <Link to="/admin/login" className="text-aces-purple-400 hover:text-aces-purple-700">
            Admin login
          </Link>
        </div>
      </footer>
    </div>
  );
}
