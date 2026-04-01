import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

function getDbUrl() {
  // In development: use local SQLite file for fast iteration
  // In production: use Turso cloud URL
  if (process.env.NODE_ENV === "production") {
    return process.env.TURSO_DATABASE_URL!;
  }
  // For local dev with Turso remote, set TURSO_LOCAL_URL to a local .db file
  // e.g. TURSO_LOCAL_URL=file:local_dev.db
  return process.env.TURSO_LOCAL_URL ?? process.env.TURSO_DATABASE_URL ?? "file:local_dev.db";
}

function getAuthToken() {
  // Only needed for Turso cloud (not for local file)
  if (process.env.NODE_ENV === "production") {
    return process.env.TURSO_AUTH_TOKEN!;
  }
  // For local dev, auth token not needed for file-based SQLite
  const localUrl = process.env.TURSO_LOCAL_URL ?? "";
  if (localUrl.startsWith("file:")) {
    return undefined;
  }
  // Remote Turso in dev needs token
  return process.env.TURSO_AUTH_TOKEN;
}

const client = createClient({
  url: getDbUrl(),
  authToken: getAuthToken(),
});

export const db = drizzle(client);
