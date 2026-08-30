import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { ensureBootstrapAdmin } from "./seed/seed";

async function start() {
  try {
    await connectDB();
    await ensureBootstrapAdmin();
    const port = Number(process.env.PORT || env.PORT);
    app.listen(port, "0.0.0.0", () => {
      // eslint-disable-next-line no-console
      console.log(`[server] ACES Election Portal API running on port ${port} (${env.NODE_ENV})`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
}

start();
