import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { sendMockEmail } from "./email";

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  emailTo?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    })
    .returning();

  if (input.emailTo) {
    await sendMockEmail({
      to: input.emailTo,
      subject: input.title,
      body: input.message,
    });
  }

  return notification;
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  return Promise.all(inputs.map(createNotification));
}
