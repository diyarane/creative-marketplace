import { db } from "@/lib/db";
import { projects, creatorProfiles, proposals } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole, requireUser } from "@/lib/auth/guards";
import { createProjectSchema } from "@/lib/validations/project";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireUser();

    if (session.role === "CLIENT") {
      const rows = await db.query.projects.findMany({
        where: eq(projects.clientId, session.userId),
        with: { creator: { with: { user: true } } },
        orderBy: [desc(projects.updatedAt)],
      });
      const counts = await db
        .select({ projectId: proposals.projectId })
        .from(proposals)
        .where(inArray(proposals.projectId, rows.map((r) => r.id).length ? rows.map((r) => r.id) : [""]));
      return rows.map((r) => ({
        ...r,
        proposalCount: counts.filter((c) => c.projectId === r.id).length,
      }));
    }

    if (session.role === "CREATOR") {
      const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
      if (!profile) return [];
      return db.query.projects.findMany({
        where: eq(projects.creatorId, profile.id),
        with: { client: true },
        orderBy: [desc(projects.updatedAt)],
      });
    }

    // ADMIN
    return db.query.projects.findMany({
      with: { client: true, creator: { with: { user: true } } },
      orderBy: [desc(projects.updatedAt)],
    });
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const body = createProjectSchema.parse(await req.json());

    const [project] = await db
      .insert(projects)
      .values({
        clientId: session.userId,
        title: body.title,
        description: body.description,
        requirements: body.requirements,
        category: body.category,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        deadline: body.deadline,
        status: body.publish ? "OPEN" : "DRAFT",
      })
      .returning();

    return project;
  });
}
