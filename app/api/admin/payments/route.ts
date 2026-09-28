import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { desc } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return db.query.payments.findMany({
      with: { project: true, client: true, creator: { with: { user: true } } },
      orderBy: [desc(payments.createdAt)],
    });
  });
}
