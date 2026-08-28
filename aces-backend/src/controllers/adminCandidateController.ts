import { Request, Response } from "express";
import Candidate from "../models/Candidate";
import Election from "../models/Election";
import AuditLog from "../models/AuditLog";
import { asyncHandler } from "../middleware/errorHandler";
import { ok, ApiError } from "../utils/apiResponse";
import { createCandidateSchema, updateCandidateSchema } from "../validators/adminValidators";
import { uploadCandidatePhoto, uploadCandidateSymbol } from "../config/cloudinary";

function getUploadedFile(req: Request, fieldName: string) {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  return files?.[fieldName]?.[0];
}

async function assertCandidatesEditable() {
  const election = await Election.findOne().sort({ createdAt: -1 });
  if (election && election.status === "LIVE") {
    throw new ApiError("Candidate editing is restricted once voting has started.", 409);
  }
}

export const listCandidates = asyncHandler(async (req: Request, res: Response) => {
  const candidates = await Candidate.find().populate("positionId", "name category order").sort({ createdAt: -1 });
  return ok(res, candidates);
});

export const createCandidate = asyncHandler(async (req: Request, res: Response) => {
  await assertCandidatesEditable();
  const data = createCandidateSchema.parse(req.body);

  const existing = await Candidate.findOne({ enrollmentNo: data.enrollmentNo, positionId: data.positionId });
  if (existing) throw new ApiError("A candidate with this enrollment number already exists for this position.", 409);

  let photoUrl: string | undefined;
  const photo = getUploadedFile(req, "photo");
  const symbol = getUploadedFile(req, "symbol");
  let symbolUrl: string | undefined;
  if (photo) {
    photoUrl = await uploadCandidatePhoto(photo.buffer, `${data.enrollmentNo}-${Date.now()}`);
  }
  if (symbol) {
    symbolUrl = await uploadCandidateSymbol(symbol.buffer, `${data.enrollmentNo}-${Date.now()}`);
  }

  const candidate = await Candidate.create({ ...data, photoUrl, symbolUrl });

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "CANDIDATE_CREATED",
    description: `Candidate "${candidate.name}" added`,
    ipAddress: req.ip,
  });

  return ok(res, candidate, 201);
});

export const updateCandidate = asyncHandler(async (req: Request, res: Response) => {
  await assertCandidatesEditable();
  const data = updateCandidateSchema.parse(req.body);

  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) throw new ApiError("Candidate not found.", 404);

  const photo = getUploadedFile(req, "photo");
  const symbol = getUploadedFile(req, "symbol");
  if (photo) {
    candidate.photoUrl = await uploadCandidatePhoto(photo.buffer, `${candidate.enrollmentNo}-${Date.now()}`);
  }
  if (symbol) {
    candidate.symbolUrl = await uploadCandidateSymbol(symbol.buffer, `${candidate.enrollmentNo}-${Date.now()}`);
  }

  Object.assign(candidate, data);
  await candidate.save();

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "CANDIDATE_UPDATED",
    description: `Candidate "${candidate.name}" updated`,
    ipAddress: req.ip,
  });

  return ok(res, candidate);
});

export const deleteCandidate = asyncHandler(async (req: Request, res: Response) => {
  await assertCandidatesEditable();
  const candidate = await Candidate.findByIdAndDelete(req.params.id);
  if (!candidate) throw new ApiError("Candidate not found.", 404);

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "CANDIDATE_DELETED",
    description: `Candidate "${candidate.name}" deleted`,
    ipAddress: req.ip,
  });

  return ok(res, { deleted: true });
});

export const setCandidateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: "ACTIVE" | "INACTIVE" };
  if (!["ACTIVE", "INACTIVE"].includes(status)) throw new ApiError("Invalid status.", 422);

  const candidate = await Candidate.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!candidate) throw new ApiError("Candidate not found.", 404);

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "CANDIDATE_UPDATED",
    description: `Candidate "${candidate.name}" set to ${status}`,
    ipAddress: req.ip,
  });

  return ok(res, candidate);
});
