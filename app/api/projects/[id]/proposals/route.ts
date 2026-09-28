import { db } from "@/lib/db";
import { projects, proposals, creatorProfiles } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { createProposalSchema } from "@/lib/validations/project";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { eq, and, desc } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;

    const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    if (!project) throw new AppError("Project not found.", 404);

    if (session.role === "CLIENT" && project.clientId !== session.userId) {
      throw new AppError("You do not have permission to view these proposals.", 403);
    }

    let rows = await db.query.proposals.findMany({
      where: eq(proposals.projectId, id),
      with: { creator: { with: { user: true } } },
      orderBy: [desc(proposals.createdAt)],
    });

    if (session.role === "CREATOR") {
      const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
      rows = rows.filter((r) => r.creatorId === profile?.id);
    }

    return rows.map((r) => ({ ...r, creator: { ...r.creator, user: { ...r.creator.user, passwordHash: undefined } } }));
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const { id } = await params;
    const body = createProposalSchema.parse(await req.json());

    const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
    if (!profile) throw new AppError("Creator profile not found.", 404);

    const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.status !== "OPEN" && project.status !== "PROPOSALS_RECEIVED") {
      throw new AppError("This project is no longer accepting proposals.", 409);
    }

    const existing = await db.query.proposals.findFirst({
      where: and(eq(proposals.projectId, id), eq(proposals.creatorId, profile.id)),
    });
    if (existing) throw new AppError("You have already submitted a proposal for this project.", 409);

    const [proposal] = await db
      .insert(proposals)
      .values({ projectId: id, creatorId: profile.id, ...body })
      .returning();

    if (project.status === "OPEN") {
      assertTransition(project.status, "PROPOSALS_RECEIVED");
      await db.update(projects).set({ status: "PROPOSALS_RECEIVED", updatedAt: new Date() }).where(eq(projects.id, id));
    }

    await createNotification({
      userId: project.clientId,
      type: "NEW_PROPOSAL",
      title: "New proposal received",
      message: `You received a new proposal for "${project.title}".`,
      link: `/projects/${id}/proposals`,
    });

    return proposal;
  });
}
