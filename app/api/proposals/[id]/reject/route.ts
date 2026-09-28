import { db } from "@/lib/db";
import { proposals, projects } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { createNotification } from "@/lib/services/notifications";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const { id } = await params;

    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, id),
      with: { creator: { with: { user: true } } },
    });
    if (!proposal) throw new AppError("Proposal not found.", 404);
    if (proposal.status !== "PENDING") throw new AppError("This proposal has already been resolved.", 409);

    const project = await db.query.projects.findFirst({ where: eq(projects.id, proposal.projectId) });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId) throw new AppError("You do not own this project.", 403);

    const [updated] = await db
      .update(proposals)
      .set({ status: "REJECTED", updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();

    await createNotification({
      userId: proposal.creator.userId,
      type: "PROPOSAL_REJECTED",
      title: "Your proposal was not selected",
      message: `The client passed on your proposal for "${project.title}".`,
      link: `/projects/opportunities`,
      emailTo: proposal.creator.user.email,
    });

    return updated;
  });
}
