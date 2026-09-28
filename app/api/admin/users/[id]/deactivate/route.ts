import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    if (id === session.userId) throw new AppError("You cannot deactivate your own account.", 400);

    const user = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!user) throw new AppError("User not found.", 404);

    const [updated] = await db
      .update(users)
      .set({ active: !user.active, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return { ...updated, passwordHash: undefined };
  });
}
