import { db } from "@/lib/db";
import { proposals, projects, creatorProfiles } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { eq, and, ne } from "drizzle-orm";

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

    assertTransition(project.status, "FREELANCER_SELECTED");

    await db
      .update(proposals)
      .set({ status: "ACCEPTED", updatedAt: new Date() })
      .where(eq(proposals.id, id));

    const rejected = await db
      .update(proposals)
      .set({ status: "REJECTED", updatedAt: new Date() })
      .where(and(eq(proposals.projectId, proposal.projectId), ne(proposals.id, id)))
      .returning();

    const [updatedProject] = await db
      .update(projects)
      .set({
        creatorId: proposal.creatorId,
        status: "FREELANCER_SELECTED",
        agreedPrice: proposal.price,
        agreedRevisions: proposal.revisionsIncluded,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, proposal.projectId))
      .returning();

    await createNotification({
      userId: proposal.creator.userId,
      type: "PROPOSAL_ACCEPTED",
      title: "Your proposal was accepted",
      message: `Your proposal for "${project.title}" was accepted. The project is now assigned to you.`,
      link: `/projects/${project.id}/workspace`,
      emailTo: proposal.creator.user.email,
    });

    for (const rejectedProposal of rejected) {
      const creatorProfile = await db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.id, rejectedProposal.creatorId),
        with: { user: true },
      });
      if (creatorProfile) {
        await createNotification({
          userId: creatorProfile.userId,
          type: "PROPOSAL_REJECTED",
          title: "Your proposal was not selected",
          message: `The client selected another creator for "${project.title}".`,
          link: `/projects/opportunities`,
          emailTo: creatorProfile.user.email,
        });
      }
    }

    return updatedProject;
  });
}
