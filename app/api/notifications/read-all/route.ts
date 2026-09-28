import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { eq } from "drizzle-orm";

export async function POST() {
  return handleRoute(async () => {
    const session = await requireUser();
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, session.userId));
    return { ok: true };
  });
}
