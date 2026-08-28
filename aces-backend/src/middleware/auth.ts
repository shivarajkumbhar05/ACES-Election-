import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/apiResponse";
import { AdminRole } from "../models/Admin";
import { verifyVotingSession, VotingSessionPayload } from "../utils/votingSession";

export interface AdminJwtPayload {
  adminId: string;
  role: AdminRole;
  username: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
      votingSession?: VotingSessionPayload;
    }
  }
}

export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError("Authentication required", 401);
  }
  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
    req.admin = decoded;
    next();
  } catch {
    throw new ApiError("Invalid or expired session", 401);
  }
}

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) throw new ApiError("Authentication required", 401);
    if (!roles.includes(req.admin.role)) {
      throw new ApiError("You are not authorized to perform this action", 403);
    }
    next();
  };
}

/** Requires the short-lived anonymous voting session issued after token validation. */
export function requireVotingSession(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError("Voting session required. Please enter your voting token again.", 401);
  }
  const token = header.slice("Bearer ".length);
  try {
    req.votingSession = verifyVotingSession(token);
    next();
  } catch {
    throw new ApiError("Voting session expired. Please enter your voting token again.", 401);
  }
}
