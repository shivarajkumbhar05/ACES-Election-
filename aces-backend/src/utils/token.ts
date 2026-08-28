import crypto from "crypto";

const TOKEN_PREFIX = "ACES";

/**
 * Generates a cryptographically secure, human-enterable voting token.
 * Format: ACES-XXXX-XXXX using an unambiguous alphabet (no 0/O/1/I).
 */
export function generateVoterToken(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const randomPart = (len: number) => {
    const bytes = crypto.randomBytes(len);
    let out = "";
    for (let i = 0; i < len; i++) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  };
  return `${TOKEN_PREFIX}-${randomPart(4)}-${randomPart(4)}`;
}

/** One-way hash of the raw token. Only the hash is persisted in the database. */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim().toUpperCase()).digest("hex");
}

export function tokenPreview(rawToken: string): string {
  const clean = rawToken.trim().toUpperCase();
  return clean.slice(-4);
}

export function normalizeToken(rawToken: string): string {
  return rawToken.trim().toUpperCase();
}
