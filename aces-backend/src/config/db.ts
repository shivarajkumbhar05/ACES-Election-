const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import { env } from "./env";
import type { MongoMemoryReplSet } from "mongodb-memory-server";

let memoryReplSet: MongoMemoryReplSet | null = null;

function getDatabaseNameFromUri(uri: string): string {
  try {
    const pathname = new URL(uri).pathname;
    return pathname.replace(/^\//, "") || "aces_election";
  } catch {
    return "aces_election";
  }
}

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log(`[db] connected -> ${mongoose.connection.name}`);
    return;
  } catch (error) {
    const shouldFallback = process.env.NODE_ENV !== "production" || !process.env.MONGODB_URI;
    if (!shouldFallback) {
      throw error;
    }

    const { MongoMemoryReplSet } = await import("mongodb-memory-server");
    const dbName = getDatabaseNameFromUri(env.MONGODB_URI);
    memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(memoryReplSet.getUri(dbName));
    // eslint-disable-next-line no-console
    console.log(`[db] fallback connected -> ${mongoose.connection.name}`);
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (memoryReplSet) {
    await memoryReplSet.stop();
    memoryReplSet = null;
  }
}