import crypto from "crypto";

/** Deterministic SHA-256 hash over a JSON-serializable payload, used for ballot & result integrity. */
export function sha256Json(payload: unknown): string {
  const json = JSON.stringify(payload, Object.keys(payload as object).sort());
  return crypto.createHash("sha256").update(json).digest("hex");
}

export function sha256String(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
