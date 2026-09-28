import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: { creator: { with: { user: true } }, client: true },
    });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId && session.role !== "ADMIN") {
      throw new AppError("Only the client who created this project can cancel it.", 403);
    }

    assertTransition(project.status, "CANCELLED");

    const [updated] = await db
      .update(projects)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (project.creator) {
      await createNotification({
        userId: project.creator.userId,
        type: "PROJECT_CANCELLED",
        title: "A project was cancelled",
        message: `"${project.title}" was cancelled by the client.`,
        link: `/projects/${project.id}`,
        emailTo: project.creator.user.email,
      });
    }

    return updated;
  });
}
