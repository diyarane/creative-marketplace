import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "node:path";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") || "./reelcraft.db";

declare global {
  // eslint-disable-next-line no-var
  var __reelcraft_sqlite__: Database.Database | undefined;
}

const sqlite =
  global.__reelcraft_sqlite__ ??
  new Database(path.isAbsolute(DB_PATH) ? DB_PATH : path.join(/*turbopackIgnore: true*/ process.cwd(), DB_PATH));

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  global.__reelcraft_sqlite__ = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
