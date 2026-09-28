import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { desc } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return db.query.projects.findMany({
      with: { client: true, creator: { with: { user: true } } },
      orderBy: [desc(projects.updatedAt)],
    });
  });
}
