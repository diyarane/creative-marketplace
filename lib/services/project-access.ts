import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { AppError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function assertProjectAccess(projectId: string, userId: string, role: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: { client: true, creator: { with: { user: true } } },
  });
  if (!project) throw new AppError("Project not found.", 404);

  if (role === "ADMIN") return project;
  if (role === "CLIENT" && project.clientId === userId) return project;
  if (role === "CREATOR" && project.creator?.userId === userId) return project;
  if (role === "CREATOR" && (project.status === "OPEN" || project.status === "PROPOSALS_RECEIVED")) return project;

  throw new AppError("You do not have permission to access this project.", 403);
}
