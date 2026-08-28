import { Router } from "express";
import multer from "multer";
import { authenticateAdmin, requireRole } from "../middleware/auth";
import { adminLoginLimiter } from "../middleware/rateLimit";
import {
  adminLogin,
  adminDashboard,
  createElection,
  startElection,
  stopElection,
  rescheduleElection,
  endElection,
  getAuditLogs,
} from "../controllers/adminController";
import {
  listCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  setCandidateStatus,
} from "../controllers/adminCandidateController";
import {
  generateTokens,
  importTokens,
  listTokens,
  revokeToken,
  exportUnusedTokens,
  generateTokenQr,
} from "../controllers/adminTokenController";
import { getResults, publishResults } from "../controllers/adminResultsController";
import { exportExcel, exportPdf } from "../controllers/adminReportsController";
import { listAdminPositions, createPosition, updatePosition, deletePosition } from "../controllers/adminPositionController";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// --- Auth (public) ---
router.post("/login", adminLoginLimiter, adminLogin);

// Everything below requires a valid admin JWT.
router.use(authenticateAdmin);

router.get("/dashboard", adminDashboard);
router.get("/audit-logs", getAuditLogs);

// --- Election management ---
router.post("/election", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), createElection);
router.post("/election/start", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), startElection);
router.post("/election/stop", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), stopElection);
router.patch("/election/reschedule", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), rescheduleElection);

// --- Positions ---
router.get("/positions", listAdminPositions);
router.post("/positions", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), createPosition);
router.put("/positions/:id", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), updatePosition);
router.delete("/positions/:id", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), deletePosition);
router.post("/election/end", requireRole("SUPER_ADMIN", "HOD", "ACES_COORDINATOR"), endElection);

// --- Candidates ---
router.get("/candidates", listCandidates);
router.post("/candidates", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), upload.fields([{ name: "photo", maxCount: 1 }, { name: "symbol", maxCount: 1 }]), createCandidate);
router.put("/candidates/:id", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), upload.fields([{ name: "photo", maxCount: 1 }, { name: "symbol", maxCount: 1 }]), updateCandidate);
router.delete("/candidates/:id", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), deleteCandidate);
router.patch("/candidates/:id/status", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), setCandidateStatus);

// --- Voter tokens ---
router.post("/tokens/generate", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), generateTokens);
router.post("/tokens/import", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), importTokens);
router.get("/tokens", listTokens);
router.post("/tokens/revoke", requireRole("SUPER_ADMIN", "ACES_COORDINATOR"), revokeToken);
router.get("/tokens/export", exportUnusedTokens);
router.post("/tokens/qr", generateTokenQr);

// --- Results & reports ---
router.get("/results", getResults);
router.post("/results/publish", requireRole("SUPER_ADMIN", "HOD", "ACES_COORDINATOR"), publishResults);
router.get("/export/excel", exportExcel);
router.get("/export/pdf", exportPdf);

export default router;
