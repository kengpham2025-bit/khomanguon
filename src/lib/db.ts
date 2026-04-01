import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

function getDbUrl() {
  // In development: use local SQLite file for fast iteration
  // In production: use Turso cloud URL
  if (process.env.NODE_ENV === "production") {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    return url;
  }
  // For local dev with Turso remote, set TURSO_LOCAL_URL to a local .db file
  // e.g. TURSO_LOCAL_URL=file:local_dev.db
  return process.env.TURSO_LOCAL_URL ?? process.env.TURSO_DATABASE_URL ?? "file:local_dev.db";
}

function getAuthToken() {
  // Only needed for Turso cloud (not for local file)
  if (process.env.NODE_ENV === "production") {
    return process.env.TURSO_AUTH_TOKEN;
  }
  // For local dev, auth token not needed for file-based SQLite
  const localUrl = process.env.TURSO_LOCAL_URL ?? "";
  if (localUrl.startsWith("file:")) {
    return undefined;
  }
  // Remote Turso in dev needs token
  return process.env.TURSO_AUTH_TOKEN;
}

// Lazy-initialized client and db to avoid build-time crashes
let _client: Client | null = null;
let _db: LibSQLDatabase | null = null;

function getClient(): Client {
  if (!_client) {
    _client = createClient({
      url: getDbUrl(),
      authToken: getAuthToken(),
    });
  }
  return _client;
}

export function getDb(): LibSQLDatabase {
  if (!_db) {
    _db = drizzle(getClient());
  }
  return _db;
}

// For backward compatibility - uses getter to lazy init
export const db = new Proxy({} as LibSQLDatabase, {
  get(_target, prop) {
    const realDb = getDb();
    const value = (realDb as any)[prop];
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});
