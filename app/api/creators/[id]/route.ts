import { db } from "@/lib/db";
import { creatorProfiles, reviews, users } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const creator = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.id, id),
      with: {
        user: true,
        portfolioItems: { orderBy: (t, { desc }) => [desc(t.createdAt)] },
        services: true,
      },
    });
    if (!creator) throw new AppError("Creator not found.", 404);

    const creatorReviews = await db.query.reviews.findMany({
      where: eq(reviews.reviewedUserId, creator.userId),
      with: { reviewer: true },
      orderBy: [desc(reviews.createdAt)],
    });

    return {
      ...creator,
      user: { ...creator.user, passwordHash: undefined },
      reviews: creatorReviews.map((r) => ({ ...r, reviewer: r.reviewer ? { ...r.reviewer, passwordHash: undefined } : undefined })),
    };
  });
}
