import { db } from "@/lib/db";
import { creatorProfiles, portfolioItems } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { eq, and } from "drizzle-orm";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const { id } = await params;
    const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
    if (!profile) throw new AppError("Creator profile not found.", 404);

    const item = await db.query.portfolioItems.findFirst({ where: eq(portfolioItems.id, id) });
    if (!item || item.creatorId !== profile.id) throw new AppError("Portfolio item not found.", 404);

    await db.delete(portfolioItems).where(and(eq(portfolioItems.id, id)));
    return { ok: true };
  });
}
