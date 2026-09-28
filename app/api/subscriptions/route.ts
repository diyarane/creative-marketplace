import { db } from "@/lib/db";
import { subscriptions, subscriptionPlans } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireUser } from "@/lib/auth/guards";
import { chargePayment } from "@/lib/services/payments";
import { createNotification } from "@/lib/services/notifications";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireUser();
    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, session.userId),
      with: { plan: true },
      orderBy: [desc(subscriptions.startDate)],
    });
    if (!sub) return null;
    return { ...sub, plan: { ...sub.plan, features: JSON.parse(sub.plan.features) } };
  });
}

const schema = z.object({ planId: z.string().min(1) });

export async function POST(req: Request) {
  return handleRoute(async () => {
    const session = await requireUser();
    const { planId } = schema.parse(await req.json());

    const plan = await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.id, planId) });
    if (!plan) throw new AppError("Plan not found.", 404);

    const result = await chargePayment({ amount: plan.price, method: "CARD" });
    if (!result.success) throw new AppError(result.failureReason || "Payment failed.", 402);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const [sub] = await db
      .insert(subscriptions)
      .values({ userId: session.userId, planId, status: "ACTIVE", startDate, endDate })
      .returning();

    await createNotification({
      userId: session.userId,
      type: "SUBSCRIPTION_ACTIVE",
      title: "Subscription activated",
      message: `Your ${plan.name} plan is now active.`,
      link: "/subscription",
    });

    return sub;
  });
}
