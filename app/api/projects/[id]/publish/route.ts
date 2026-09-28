import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { assertTransition } from "@/lib/services/project-state-machine";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const { id } = await params;

    const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId) throw new AppError("You do not own this project.", 403);

    assertTransition(project.status, "OPEN");

    const [updated] = await db
      .update(projects)
      .set({ status: "OPEN", updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    return updated;
  });
}
