import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { contactSchema } from "@/lib/validations/contact";
import { sendMockEmail } from "@/lib/services/email";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const json = await req.json();
    const data = contactSchema.parse(json);

    const referenceId = `RC-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    // Find platform administrator to receive internal alert
    const admin = await db.query.users.findFirst({
      where: eq(users.role, "ADMIN"),
    });

    if (admin) {
      await db.insert(notifications).values({
        userId: admin.id,
        type: "CONTACT_ENQUIRY",
        title: `Contact: ${data.subject}`,
        message: `${data.name} (${data.email}) [${data.category}]: ${data.message.slice(0, 180)}`,
        link: "/admin",
      });
    }

    // Call mock email delivery service (logs to server console in dev)
    await sendMockEmail({
      to: admin?.email || "team@reelcraft.internal",
      subject: `[Reelcraft Contact - ${data.category}] ${data.subject}`,
      body: `Reference: ${referenceId}\nFrom: ${data.name} <${data.email}>\nCategory: ${data.category}\n\n${data.message}`,
    });

    return {
      referenceId,
      category: data.category,
      receivedAt: new Date().toISOString(),
      message: "Your message has been received by the Reelcraft team.",
    };
  });
}
