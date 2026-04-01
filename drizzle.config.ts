import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // For db:push / db:migrate — connects to Turso cloud
    url: process.env.TURSO_DATABASE_URL ?? "file:local_dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} as Config;
