import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(128),
});

export const createCandidateSchema = z.object({
  name: z.string().min(2).max(100),
  enrollmentNo: z.string().min(1).max(50),
  className: z.string().min(1).max(30),
  positionId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const generateTokensSchema = z.object({
  electionId: z.string().min(1),
  count: z.number().int().min(1).max(5000),
});

export const importTokensSchema = z.object({
  electionId: z.string().min(1),
  count: z.number().int().min(1).max(5000),
});

export const revokeTokenSchema = z.object({
  tokenId: z.string().min(1),
});

export const createElectionSchema = z.object({
  name: z.string().min(3).max(150),
  department: z.string().min(2).max(150).optional(),
  startAt: z.string().datetime().or(z.string().min(1)),
  endAt: z.string().datetime().or(z.string().min(1)),
});

export const endElectionSchema = z.object({
  electionId: z.string().min(1),
  password: z.string().min(1),
});

export const startElectionSchema = z.object({
  electionId: z.string().min(1),
});

export const rescheduleElectionSchema = z.object({
  electionId: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});
