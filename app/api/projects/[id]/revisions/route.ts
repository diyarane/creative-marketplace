import { db } from "@/lib/db";
import { projects, revisions } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { revisionRequestSchema } from "@/lib/validations/project";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { assertProjectAccess } from "@/lib/services/project-access";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    await assertProjectAccess(id, session.userId, session.role);
    return db.query.revisions.findMany({ where: eq(revisions.projectId, id), orderBy: [desc(revisions.createdAt)] });
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const { id } = await params;
    const body = revisionRequestSchema.parse(await req.json());

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: { creator: { with: { user: true } } },
    });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId) throw new AppError("You do not own this project.", 403);

    assertTransition(project.status, "REVISION_REQUESTED");

    const [revision] = await db
      .insert(revisions)
      .values({ projectId: id, requestedBy: session.userId, description: body.description })
      .returning();

    await db.update(projects).set({ status: "REVISION_REQUESTED", updatedAt: new Date() }).where(eq(projects.id, id));

    if (project.creator) {
      await createNotification({
        userId: project.creator.userId,
        type: "REVISION_REQUESTED",
        title: "Revision requested",
        message: `The client requested a revision on "${project.title}".`,
        link: `/projects/${id}/workspace`,
        emailTo: project.creator.user.email,
      });
    }

    return revision;
  });
}
