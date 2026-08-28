import { Request, Response } from "express";
import ExcelJS from "exceljs";
import QRCode from "qrcode";
import VoterToken from "../models/VoterToken";
import Election from "../models/Election";
import AuditLog from "../models/AuditLog";
import { asyncHandler } from "../middleware/errorHandler";
import { ok, ApiError } from "../utils/apiResponse";
import { generateTokensSchema, importTokensSchema, revokeTokenSchema } from "../validators/adminValidators";
import { generateVoterToken, hashToken, tokenPreview } from "../utils/token";

async function createTokenBatch(electionId: string, count: number) {
  const raw: string[] = [];
  const docs = [];
  for (let i = 0; i < count; i++) {
    const t = generateVoterToken();
    raw.push(t);
    docs.push({ electionId, tokenHash: hashToken(t), tokenPreview: tokenPreview(t), status: "ACTIVE" as const });
  }
  await VoterToken.insertMany(docs, { ordered: false });
  return raw;
}

/** Generate N brand-new tokens. The plaintext tokens are returned ONCE for distribution and never stored. */
export const generateTokens = asyncHandler(async (req: Request, res: Response) => {
  const { electionId, count } = generateTokensSchema.parse(req.body);

  const election = await Election.findById(electionId);
  if (!election) throw new ApiError("Election not found.", 404);

  const rawTokens = await createTokenBatch(electionId, count);

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "TOKEN_GENERATED",
    description: `${count} voting tokens generated`,
    electionId,
    ipAddress: req.ip,
  });

  return ok(res, { count: rawTokens.length, tokens: rawTokens });
});

/** "Import" here means bulk-generating a batch tied to an eligible-student count, matching the spec's Excel-import workflow. */
export const importTokens = asyncHandler(async (req: Request, res: Response) => {
  const { electionId, count } = importTokensSchema.parse(req.body);

  const election = await Election.findById(electionId);
  if (!election) throw new ApiError("Election not found.", 404);

  const rawTokens = await createTokenBatch(electionId, count);

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "TOKEN_IMPORTED",
    description: `${count} voting tokens imported/generated`,
    electionId,
    ipAddress: req.ip,
  });

  return ok(res, { count: rawTokens.length, tokens: rawTokens });
});

export const listTokens = asyncHandler(async (req: Request, res: Response) => {
  const { electionId, status } = req.query as { electionId?: string; status?: string };
  const filter: Record<string, unknown> = {};
  if (electionId) filter.electionId = electionId;
  if (status) filter.status = status;

  const tokens = await VoterToken.find(filter).select("tokenPreview status usedAt createdAt").sort({ createdAt: -1 });
  const total = await VoterToken.countDocuments(filter);
  const used = await VoterToken.countDocuments({ ...filter, status: "USED" });
  const active = await VoterToken.countDocuments({ ...filter, status: "ACTIVE" });
  const revoked = await VoterToken.countDocuments({ ...filter, status: "REVOKED" });

  return ok(res, { tokens, total, used, active, revoked });
});

export const revokeToken = asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = revokeTokenSchema.parse(req.body);
  const token = await VoterToken.findById(tokenId);
  if (!token) throw new ApiError("Token not found.", 404);
  if (token.status !== "ACTIVE") throw new ApiError("Only an active, unused token can be revoked.", 409);

  token.status = "REVOKED";
  token.revokedAt = new Date();
  await token.save();

  await AuditLog.create({
    adminId: req.admin!.adminId,
    action: "TOKEN_REVOKED",
    description: `Token ****-${token.tokenPreview} revoked`,
    electionId: token.electionId,
    ipAddress: req.ip,
  });

  return ok(res, token);
});

/** Export unused tokens as an Excel workbook for distribution to eligible voters. */
export const exportUnusedTokens = asyncHandler(async (req: Request, res: Response) => {
  // NOTE: raw tokens are never stored, so "export unused tokens" here re-issues a
  // fresh batch to replace any not-yet-distributed ACTIVE tokens is not possible
  // without the plaintext. This endpoint exports the *status list* (hashed refs)
  // for auditing; for distributing new tokens use /generate or /import, which
  // return the plaintext values at creation time.
  const { electionId } = req.query as { electionId?: string };
  const filter: Record<string, unknown> = { status: "ACTIVE" };
  if (electionId) filter.electionId = electionId;

  const tokens = await VoterToken.find(filter).select("tokenPreview status createdAt");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Unused Tokens");
  sheet.columns = [
    { header: "Token Reference (last 4)", key: "ref", width: 24 },
    { header: "Status", key: "status", width: 14 },
    { header: "Created At", key: "createdAt", width: 24 },
  ];
  for (const t of tokens) {
    sheet.addRow({ ref: `****-${t.tokenPreview}`, status: t.status, createdAt: t.createdAt });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=unused-tokens.xlsx");
  res.send(Buffer.from(buffer));
});

/** Generate a QR code (PNG data URL) for a given raw token, provided by the admin at generation time. */
export const generateTokenQr = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) throw new ApiError("Token value is required.", 422);
  const dataUrl = await QRCode.toDataURL(token, { errorCorrectionLevel: "M", margin: 2, width: 300 });
  return ok(res, { qrCode: dataUrl });
});
