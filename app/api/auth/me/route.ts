import { getSession } from "@/lib/auth/session";
import { handleRoute } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const session = await getSession();
    if (!session) return null;
    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
    if (!user || !user.active) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  });
}
