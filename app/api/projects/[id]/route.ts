import { handleRoute } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { assertProjectAccess } from "@/lib/services/project-access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { id } = await params;
    const project = await assertProjectAccess(id, session.userId, session.role);
    return { ...project, client: { ...project.client, passwordHash: undefined } };
  });
}
