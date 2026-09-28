import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireUser();
    return db.query.notifications.findMany({
      where: eq(notifications.userId, session.userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });
  });
}
