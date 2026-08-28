import { Request, Response } from "express";
import Election from "../models/Election";
import AuditLog from "../models/AuditLog";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../utils/apiResponse";
import { buildResultsExcel } from "../exports/excelExport";
import { buildResultsPdf } from "../exports/pdfExport";

async function assertResultsAvailable(electionId?: string) {
  const election = electionId ? await Election.findById(electionId) : await Election.findOne().sort({ createdAt: -1 });
  if (!election) throw new ApiError("Election not found.", 404);
  if (election.status !== "ENDED" && election.status !== "RESULTS_PUBLISHED") {
    throw new ApiError("Results are only available after the election has ended.", 403);
  }
  return election;
}

export const exportExcel = asyncHandler(async (req: Request, res: Response) => {
  const { electionId } = req.query as { electionId?: string };
  const election = await assertResultsAvailable(electionId);

  const buffer = await buildResultsExcel(String(election._id));

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "RESULT_EXPORTED",
    description: `Results exported as Excel for "${election.name}"`,
    electionId: election._id,
    ipAddress: req.ip,
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=aces-election-results.xlsx`);
  res.send(Buffer.from(buffer));
});

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const { electionId } = req.query as { electionId?: string };
  const election = await assertResultsAvailable(electionId);

  const buffer = await buildResultsPdf(String(election._id));

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "RESULT_EXPORTED",
    description: `Results exported as PDF for "${election.name}"`,
    electionId: election._id,
    ipAddress: req.ip,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=aces-election-results.pdf`);
  res.send(buffer);
});
