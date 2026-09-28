import { db } from "@/lib/db";
import { handleRoute } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { desc } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const all = await db.query.users.findMany({ orderBy: [desc(users.createdAt)] });
    return all.map((u) => ({ ...u, passwordHash: undefined }));
  });
}
