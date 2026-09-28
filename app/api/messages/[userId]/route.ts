import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { and, or, eq, asc } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { userId } = await params;

    const other = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!other) throw new AppError("User not found.", 404);

    const thread = await db.query.messages.findMany({
      where: or(
        and(eq(messages.senderId, session.userId), eq(messages.receiverId, userId)),
        and(eq(messages.senderId, userId), eq(messages.receiverId, session.userId))
      ),
      orderBy: [asc(messages.createdAt)],
    });

    await db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.senderId, userId), eq(messages.receiverId, session.userId)));

    return { user: { id: other.id, name: other.name, avatar: other.avatar, role: other.role }, messages: thread };
  });
}
