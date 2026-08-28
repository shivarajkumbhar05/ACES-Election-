import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import HomePage from "./pages/public/HomePage";
import TokenEntryPage from "./pages/public/TokenEntryPage";
import SelectCandidatesPage from "./pages/public/SelectCandidatesPage";
import ReviewBallotPage from "./pages/public/ReviewBallotPage";
import ConfirmationPage from "./pages/public/ConfirmationPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ManageCandidatesPage from "./pages/admin/ManageCandidatesPage";
import ManagePositionsPage from "./pages/admin/ManagePositionsPage";
import EndElectionPage from "./pages/admin/EndElectionPage";
import ResultsPage from "./pages/admin/ResultsPage";

import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Student-facing voting flow */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/vote" element={<TokenEntryPage />} />
        <Route path="/vote/select" element={<SelectCandidatesPage />} />
        <Route path="/vote/review" element={<ReviewBallotPage />} />
        <Route path="/vote/confirmation" element={<ConfirmationPage />} />
      </Route>

      {/* Admin control panel */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="candidates" element={<ManageCandidatesPage />} />
        <Route path="positions" element={<ManagePositionsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="end-election" element={<EndElectionPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
