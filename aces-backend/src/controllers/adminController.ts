import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import Election from "../models/Election";
import AuditLog from "../models/AuditLog";
import { asyncHandler } from "../middleware/errorHandler";
import { ok, ApiError } from "../utils/apiResponse";
import { adminLoginSchema, createElectionSchema, startElectionSchema, endElectionSchema, rescheduleElectionSchema } from "../validators/adminValidators";
import { env } from "../config/env";
import { computeSummary } from "../services/resultService";

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = adminLoginSchema.parse(req.body);

  const admin = await Admin.findOne({ username: username.toLowerCase(), active: true });
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!admin || !valid) {
    await AuditLog.create({
      action: "ADMIN_LOGIN_FAILED",
      description: `Failed login attempt for username "${username}"`,
      ipAddress: req.ip,
    });
    throw new ApiError("Invalid username or password.", 401);
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = jwt.sign(
    { adminId: String(admin._id), role: admin.role, username: admin.username },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  await AuditLog.create({
    adminId: admin._id,
    action: "ADMIN_LOGIN",
    description: `${admin.username} logged in`,
    ipAddress: req.ip,
  });

  return ok(res, { token, admin: { id: admin._id, username: admin.username, role: admin.role } });
});

export const adminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const election = await Election.findOne().sort({ createdAt: -1 });
  if (!election) {
    return ok(res, {
      election: null,
      stats: { eligibleStudents: 0, votesCast: 0, remaining: 0, participationPercent: 0 },
      recentActivity: [],
    });
  }

  const summary = await computeSummary(String(election._id));
  const recentActivity = await AuditLog.find({ electionId: election._id }).sort({ createdAt: -1 }).limit(20);

  return ok(res, {
    election: {
      id: election._id,
      name: election.name,
      status: election.status,
      startAt: election.startAt,
      endAt: election.endAt,
    },
    stats: {
      eligibleStudents: summary.eligibleStudents,
      votesCast: summary.votesCast,
      remaining: summary.remaining,
      participationPercent: summary.participationPercent,
    },
    recentActivity,
  });
});

export const createElection = asyncHandler(async (req: Request, res: Response) => {
  const data = createElectionSchema.parse(req.body);
  const election = await Election.create({
    name: data.name,
    department: data.department || "Computer Engineering",
    startAt: new Date(data.startAt),
    endAt: new Date(data.endAt),
    status: "SCHEDULED",
    createdBy: req.admin!.adminId,
  });

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "ELECTION_CREATED",
    description: `Election "${election.name}" created`,
    electionId: election._id,
    ipAddress: req.ip,
  });

  return ok(res, election, 201);
});

export const startElection = asyncHandler(async (req: Request, res: Response) => {
  const { electionId } = startElectionSchema.parse(req.body);
  const election = await Election.findById(electionId);
  if (!election) throw new ApiError("Election not found.", 404);
  if (!["SCHEDULED", "PAUSED"].includes(election.status)) throw new ApiError("Only a scheduled or paused election can be started.", 409);

  election.status = "LIVE";
  await election.save();

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "ELECTION_STARTED",
    description: `Election "${election.name}" started`,
    electionId: election._id,
    ipAddress: req.ip,
  });

  return ok(res, election);
});

export const stopElection = asyncHandler(async (req: Request, res: Response) => {
  const { electionId } = startElectionSchema.parse(req.body);
  const election = await Election.findById(electionId);
  if (!election) throw new ApiError("Election not found.", 404);
  if (election.status !== "LIVE") throw new ApiError("Only a live election can be stopped.", 409);
  election.status = "PAUSED";
  await election.save();
  await AuditLog.create({ adminId: req.admin!.adminId, action: "ELECTION_STOPPED", description: `Election "${election.name}" stopped`, electionId: election._id, ipAddress: req.ip });
  return ok(res, election);
});

export const rescheduleElection = asyncHandler(async (req: Request, res: Response) => {
  const data = rescheduleElectionSchema.parse(req.body);
  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    throw new ApiError("End time must be after the start time.", 422);
  }
  const election = await Election.findById(data.electionId);
  if (!election) throw new ApiError("Election not found.", 404);
  if (!["SCHEDULED", "PAUSED"].includes(election.status)) throw new ApiError("Only a scheduled or paused election can be rescheduled.", 409);
  election.startAt = startAt;
  election.endAt = endAt;
  election.status = "SCHEDULED";
  await election.save();
  await AuditLog.create({ adminId: req.admin!.adminId, action: "ELECTION_RESCHEDULED", description: `Election "${election.name}" rescheduled`, electionId: election._id, ipAddress: req.ip });
  return ok(res, election);
});

export const endElection = asyncHandler(async (req: Request, res: Response) => {
  const { electionId, password } = endElectionSchema.parse(req.body);

  const admin = await Admin.findById(req.admin!.adminId);
  if (!admin) throw new ApiError("Admin not found.", 401);

  const passwordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordValid) throw new ApiError("Incorrect administrator password.", 401);

  const election = await Election.findById(electionId);
  if (!election) throw new ApiError("Election not found.", 404);
  if (election.status !== "LIVE") throw new ApiError("Only a live election can be ended.", 409);

  election.status = "ENDED";
  election.endedAt = new Date();
  election.endedBy = admin._id as any;
  await election.save();

  await AuditLog.create({
    adminId: admin._id,
    action: "ELECTION_ENDED",
    description: `Election "${election.name}" ended by ${admin.username}`,
    electionId: election._id,
    ipAddress: req.ip,
  });

  return ok(res, election);
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  return ok(res, logs);
});
