import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] ACES Election Portal API running on port ${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
}

start();
