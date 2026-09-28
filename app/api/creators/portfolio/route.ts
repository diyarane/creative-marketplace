import { db } from "@/lib/db";
import { creatorProfiles, portfolioItems } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { portfolioItemSchema } from "@/lib/validations/profile";
import { eq } from "drizzle-orm";

async function getOwnProfile(userId: string) {
  const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, userId) });
  if (!profile) throw new AppError("Creator profile not found.", 404);
  return profile;
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const profile = await getOwnProfile(session.userId);
    const body = portfolioItemSchema.parse(await req.json());

    const [item] = await db
      .insert(portfolioItems)
      .values({
        creatorId: profile.id,
        title: body.title,
        description: body.description,
        category: body.category,
        mediaType: body.mediaType,
        mediaUrl: `/media/${body.gradient}`,
        thumbnailUrl: `/media/${body.gradient}`,
        gradient: body.gradient,
      })
      .returning();

    return item;
  });
}
