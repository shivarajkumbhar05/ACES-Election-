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
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: required("MONGODB_URI", "mongodb://127.0.0.1:27017/aces_election"),
  JWT_SECRET: required("JWT_SECRET", "dev_secret_change_me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  ELECTION_NAME: process.env.ELECTION_NAME || "ACES Election",
  VOTING_SESSION_SECRET: required("VOTING_SESSION_SECRET", "dev_voting_secret_change_me"),
  VOTING_SESSION_TTL_MINUTES: parseInt(process.env.VOTING_SESSION_TTL_MINUTES || "15", 10),
};
