import { Request, Response } from "express";
import Position from "../models/Position";
import { asyncHandler } from "../middleware/errorHandler";
import { ok } from "../utils/apiResponse";

export const listPositions = asyncHandler(async (req: Request, res: Response) => {
  const positions = await Position.find({ active: true }).sort({ order: 1 });
  return ok(res, positions);
});
