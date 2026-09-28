import { db } from "@/lib/db";
import { projects, reviews, creatorProfiles } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { reviewSchema } from "@/lib/validations/project";
import { createNotification } from "@/lib/services/notifications";
import { assertProjectAccess } from "@/lib/services/project-access";
import { eq, and } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    await assertProjectAccess(id, session.userId, session.role);
    return db.query.reviews.findMany({ where: eq(reviews.projectId, id), with: { reviewer: true } });
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    const body = reviewSchema.parse(await req.json());

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: { creator: { with: { user: true } }, client: true },
    });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.status !== "COMPLETED") throw new AppError("You can only review completed projects.", 409);

    let reviewedUserId: string;
    if (session.role === "CLIENT" && project.clientId === session.userId) {
      if (!project.creator) throw new AppError("This project has no creator to review.", 409);
      reviewedUserId = project.creator.userId;
    } else if (session.role === "CREATOR" && project.creator?.userId === session.userId) {
      reviewedUserId = project.clientId;
    } else {
      throw new AppError("You are not part of this project.", 403);
    }

    const existing = await db.query.reviews.findFirst({
      where: and(eq(reviews.projectId, id), eq(reviews.reviewerId, session.userId)),
    });
    if (existing) throw new AppError("You have already reviewed this project.", 409);

    const [review] = await db
      .insert(reviews)
      .values({ projectId: id, reviewerId: session.userId, reviewedUserId, rating: body.rating, comment: body.comment })
      .returning();

    // recompute creator aggregate rating whenever the creator is the one being reviewed
    if (project.creator && reviewedUserId === project.creator.userId) {
      const allCreatorReviews = await db.query.reviews.findMany({ where: eq(reviews.reviewedUserId, reviewedUserId) });
      const avg = allCreatorReviews.reduce((sum, r) => sum + r.rating, 0) / allCreatorReviews.length;
      await db
        .update(creatorProfiles)
        .set({ rating: Math.round(avg * 10) / 10, totalReviews: allCreatorReviews.length, updatedAt: new Date() })
        .where(eq(creatorProfiles.id, project.creator.id));

      await createNotification({
        userId: project.creator.userId,
        type: "NEW_REVIEW",
        title: "You received a new review",
        message: `The client left a ${body.rating}-star review on "${project.title}".`,
        link: `/reviews`,
        emailTo: project.creator.user.email,
      });
    } else {
      await createNotification({
        userId: reviewedUserId,
        type: "NEW_REVIEW",
        title: "You received a new review",
        message: `You received a ${body.rating}-star review for "${project.title}".`,
        link: `/dashboard/client`,
        emailTo: project.client.email,
      });
    }

    return review;
  });
}
