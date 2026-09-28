import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    const notification = await db.query.notifications.findFirst({ where: eq(notifications.id, id) });
    if (!notification || notification.userId !== session.userId) throw new AppError("Notification not found.", 404);
    const [updated] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
    return updated;
  });
}
