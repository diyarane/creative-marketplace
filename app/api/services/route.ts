import { db } from "@/lib/db";
import { creatorProfiles, services } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { serviceSchema } from "@/lib/validations/profile";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");
    const category = searchParams.get("category");

    const conditions = [eq(services.active, true)];
    if (creatorId) conditions.push(eq(services.creatorId, creatorId));
    if (category) conditions.push(eq(services.category, category));

    return db.query.services.findMany({
      where: and(...conditions),
      with: { creator: { with: { user: true } } },
      orderBy: [desc(services.createdAt)],
    });
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
    if (!profile) throw new AppError("Creator profile not found.", 404);

    const body = serviceSchema.parse(await req.json());
    const [service] = await db
      .insert(services)
      .values({ creatorId: profile.id, ...body })
      .returning();
    return service;
  });
}
