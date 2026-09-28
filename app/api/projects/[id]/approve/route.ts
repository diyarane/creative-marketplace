import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const { id } = await params;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: { creator: { with: { user: true } } },
    });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId) throw new AppError("You do not own this project.", 403);

    assertTransition(project.status, "APPROVED");

    const [updated] = await db
      .update(projects)
      .set({ status: "APPROVED", updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (project.creator) {
      await createNotification({
        userId: project.creator.userId,
        type: "WORK_APPROVED",
        title: "Work approved",
        message: `Your work on "${project.title}" was approved. Payment is on its way.`,
        link: `/projects/${id}/workspace`,
        emailTo: project.creator.user.email,
      });
    }

    return updated;
  });
}
