import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { messageSchema } from "@/lib/validations/profile";
import { createNotification } from "@/lib/services/notifications";
import { eq, or, desc } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireUser();

    const all = await db.query.messages.findMany({
      where: or(eq(messages.senderId, session.userId), eq(messages.receiverId, session.userId)),
      with: { sender: true, receiver: true },
      orderBy: [desc(messages.createdAt)],
    });

    // group into conversations by "the other person"
    const conversations = new Map<string, { user: typeof all[number]["sender"]; lastMessage: (typeof all)[number]; unread: number }>();
    for (const m of all) {
      const otherUser = m.senderId === session.userId ? m.receiver : m.sender;
      const key = otherUser.id;
      if (!conversations.has(key)) {
        conversations.set(key, { user: otherUser, lastMessage: m, unread: 0 });
      }
      if (m.receiverId === session.userId && !m.read) {
        conversations.get(key)!.unread += 1;
      }
    }

    return Array.from(conversations.values())
      .map((c) => ({ ...c, user: { ...c.user, passwordHash: undefined } }))
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const session = await requireUser();
    const body = messageSchema.parse(await req.json());

    const receiver = await db.query.users.findFirst({ where: eq(users.id, body.receiverId) });
    if (!receiver) throw new AppError("Recipient not found.", 404);

    const [message] = await db
      .insert(messages)
      .values({
        senderId: session.userId,
        receiverId: body.receiverId,
        projectId: body.projectId || null,
        content: body.content,
      })
      .returning();

    await createNotification({
      userId: body.receiverId,
      type: "NEW_MESSAGE",
      title: "New message",
      message: `${session.name} sent you a message.`,
      link: `/messages?with=${session.userId}`,
      emailTo: receiver.email,
    });

    return message;
  });
}
