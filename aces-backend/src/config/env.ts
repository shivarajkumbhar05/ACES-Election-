import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get PORT() {
    return parseInt(process.env.PORT || "5000", 10);
  },
  get NODE_ENV() {
    return process.env.NODE_ENV || "development";
  },
  get MONGODB_URI() {
    return required("MONGODB_URI", "mongodb://127.0.0.1:27017/aces_election");
  },
  get JWT_SECRET() {
    return required("JWT_SECRET", "dev_secret_change_me");
  },
  get JWT_EXPIRES_IN() {
    return process.env.JWT_EXPIRES_IN || "8h";
  },
  get ADMIN_USERNAME() {
    return process.env.ADMIN_USERNAME || "admin";
  },
  get ADMIN_PASSWORD_HASH() {
    return process.env.ADMIN_PASSWORD_HASH || "";
  },
  get ADMIN_PASSWORD() {
    return process.env.ADMIN_PASSWORD || "";
  },
  get CLIENT_URL() {
    return process.env.CLIENT_URL || "http://localhost:5173";
  },
  get CLOUDINARY_CLOUD_NAME() {
    return process.env.CLOUDINARY_CLOUD_NAME || "";
  },
  get CLOUDINARY_API_KEY() {
    return process.env.CLOUDINARY_API_KEY || "";
  },
  get CLOUDINARY_API_SECRET() {
    return process.env.CLOUDINARY_API_SECRET || "";
  },
  get ELECTION_NAME() {
    return process.env.ELECTION_NAME || "ACES Election";
  },
  get VOTING_SESSION_SECRET() {
    return required("VOTING_SESSION_SECRET", "dev_voting_secret_change_me");
  },
  get VOTING_SESSION_TTL_MINUTES() {
    return parseInt(process.env.VOTING_SESSION_TTL_MINUTES || "15", 10);
  },
};
