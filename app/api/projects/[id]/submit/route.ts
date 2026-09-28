import { db } from "@/lib/db";
import { projects, projectFiles, revisions } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  fileName: z.string().trim().min(1).max(200),
  note: z.string().trim().max(1000).default(""),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const { id } = await params;
    const body = schema.parse(await req.json());

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: { creator: true, client: true },
    });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.creator?.userId !== session.userId) throw new AppError("You are not assigned to this project.", 403);

    assertTransition(project.status, "SUBMITTED");

    await db.insert(projectFiles).values({
      projectId: id,
      uploadedBy: session.userId,
      fileName: body.fileName,
      fileUrl: `/mock-storage/${id}/${encodeURIComponent(body.fileName)}`,
      fileType: body.fileName.split(".").pop() || "file",
      fileSize: 1_200_000,
      kind: "SUBMISSION",
      note: body.note,
    });

    // resolve any open revision requests now that new work has been submitted
    await db
      .update(revisions)
      .set({ status: "RESOLVED", resolvedAt: new Date() })
      .where(and(eq(revisions.projectId, id), eq(revisions.status, "OPEN")));

    const [updated] = await db
      .update(projects)
      .set({ status: "SUBMITTED", updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    await createNotification({
      userId: project.clientId,
      type: "WORK_SUBMITTED",
      title: "Work submitted for review",
      message: `New work was submitted for "${project.title}". Take a look and approve or request changes.`,
      link: `/projects/${id}/workspace`,
      emailTo: project.client.email,
    });

    return updated;
  });
}
