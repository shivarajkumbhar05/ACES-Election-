import { Request, Response } from "express";
import Position from "../models/Position";
import { asyncHandler } from "../middleware/errorHandler";
import { ok, ApiError } from "../utils/apiResponse";

export const listAdminPositions = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await Position.find().sort({ order: 1, name: 1 }));
});

export const createPosition = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, order } = req.body as { name?: string; category?: string; order?: number };
  if (!name?.trim() || !["TYCO", "SYCO"].includes(category || "") || !Number.isInteger(Number(order))) {
    throw new ApiError("Name, category, and a whole-number order are required.", 422);
  }
  const position = await Position.create({ name: name.trim(), category, order: Number(order), active: true });
  return ok(res, position, 201);
});

export const updatePosition = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, order, active } = req.body as { name?: string; category?: string; order?: number; active?: boolean };
  if (!name?.trim() || !["TYCO", "SYCO"].includes(category || "") || !Number.isInteger(Number(order))) {
    throw new ApiError("Name, category, and a whole-number order are required.", 422);
  }
  const position = await Position.findByIdAndUpdate(req.params.id, { name: name.trim(), category, order: Number(order), active: active !== false }, { new: true, runValidators: true });
  if (!position) throw new ApiError("Position not found.", 404);
  return ok(res, position);
});

export const deletePosition = asyncHandler(async (req: Request, res: Response) => {
  const position = await Position.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!position) throw new ApiError("Position not found.", 404);
  return ok(res, position);
});