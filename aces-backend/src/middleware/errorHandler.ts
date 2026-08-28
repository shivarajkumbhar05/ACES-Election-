import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiResponse";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }

  if (err?.name === "ZodError") {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate entry detected" });
  }

  // eslint-disable-next-line no-console
  console.error("[unhandled error]", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
