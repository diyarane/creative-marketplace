import { db } from "@/lib/db";
import { creatorProfiles, services } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { serviceSchema } from "@/lib/validations/profile";
import { eq } from "drizzle-orm";

async function assertOwnership(userId: string, serviceId: string) {
  const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, userId) });
  if (!profile) throw new AppError("Creator profile not found.", 404);
  const service = await db.query.services.findFirst({ where: eq(services.id, serviceId) });
  if (!service || service.creatorId !== profile.id) throw new AppError("Service not found.", 404);
  return service;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const { id } = await params;
    await assertOwnership(session.userId, id);
    const body = serviceSchema.parse(await req.json());
    const [updated] = await db.update(services).set({ ...body, updatedAt: new Date() }).where(eq(services.id, id)).returning();
    return updated;
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CREATOR");
    const { id } = await params;
    await assertOwnership(session.userId, id);
    await db.update(services).set({ active: false, updatedAt: new Date() }).where(eq(services.id, id));
    return { ok: true };
  });
}
