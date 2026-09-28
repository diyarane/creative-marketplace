import { db } from "@/lib/db";
import { projects, proposals, creatorProfiles } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { eq, desc, inArray, or } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });

    const open = await db.query.projects.findMany({
      where: or(eq(projects.status, "OPEN"), eq(projects.status, "PROPOSALS_RECEIVED")),
      with: { client: true },
      orderBy: [desc(projects.createdAt)],
    });

    const myProposals = profile
      ? await db.query.proposals.findMany({ where: eq(proposals.creatorId, profile.id) })
      : [];
    const proposedIds = new Set(myProposals.map((p) => p.projectId));

    return open.map((p) => ({
      ...p,
      client: { ...p.client, passwordHash: undefined },
      hasProposed: proposedIds.has(p.id),
    }));
  });
}
