import { db } from "@/lib/db";
import { creatorProfiles } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { creatorProfileSchema } from "@/lib/validations/profile";
import { eq } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const profile = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, session.userId),
      with: { user: true, portfolioItems: true, services: true },
    });
    if (!profile) throw new AppError("Creator profile not found.", 404);
    return { ...profile, user: { ...profile.user, passwordHash: undefined } };
  });
}

export async function PUT(req: Request) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const body = creatorProfileSchema.parse(await req.json());

    const existing = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
    if (!existing) throw new AppError("Creator profile not found.", 404);

    const [updated] = await db
      .update(creatorProfiles)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, session.userId))
      .returning();

    return updated;
  });
}
