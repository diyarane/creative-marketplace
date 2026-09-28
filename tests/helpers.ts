import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";
import path from "node:path";

/** In-memory database with the real migrations applied. */
export function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.resolve(__dirname, "../drizzle") });
  return { db, sqlite };
}

export async function makeUser(db: ReturnType<typeof createTestDb>["db"], role: "CLIENT" | "CREATOR" | "ADMIN", email: string) {
  const [u] = await db.insert(schema.users).values({ name: email.split("@")[0], email, passwordHash: "x", role, avatar: "gradient-1" }).returning();
  return u;
}
