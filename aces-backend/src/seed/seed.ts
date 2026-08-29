/**
 * Development seed script.
 * Usage: npm run seed
 *
 * Creates:
 *  - One bootstrap SUPER_ADMIN account (from .env: ADMIN_USERNAME / ADMIN_PASSWORD_HASH)
 */
import bcrypt from "bcrypt";
import { connectDB, disconnectDB } from "../config/db";
import { env } from "../config/env";
import Admin from "../models/Admin";

export async function ensureBootstrapAdmin() {
  let admin = await Admin.findOne({ username: env.ADMIN_USERNAME.toLowerCase() });

  if (!admin) {
    if (!env.ADMIN_PASSWORD_HASH && !env.ADMIN_PASSWORD) {
      throw new Error("Set ADMIN_PASSWORD_HASH or ADMIN_PASSWORD before running the seed.");
    }

    const passwordHash = env.ADMIN_PASSWORD_HASH || (await bcrypt.hash(env.ADMIN_PASSWORD, 12));
    admin = await Admin.create({
      username: env.ADMIN_USERNAME.toLowerCase(),
      passwordHash,
      role: "SUPER_ADMIN",
      active: true,
    });

    console.log(`[seed] Admin created: ${admin.username}`);
    return { created: true, admin };
  }

  if (env.ADMIN_PASSWORD_HASH && admin.passwordHash !== env.ADMIN_PASSWORD_HASH) {
    admin.passwordHash = env.ADMIN_PASSWORD_HASH;
    admin.active = true;
    await admin.save();
    console.log(`[seed] Admin password hash updated: ${admin.username}`);
  }

  console.log(`[seed] Admin already exists: ${admin.username}`);
  return { created: false, admin };
}

async function run() {
  await connectDB();
  await ensureBootstrapAdmin();
  console.log("[seed] Done.");
  await disconnectDB();
  process.exit(0);
}

if (require.main === module) {
  run().catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  });
}
