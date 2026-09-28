import { db } from "@/lib/db";
import { subscriptionPlans } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";

export async function GET() {
  return handleRoute(async () => {
    const plans = await db.query.subscriptionPlans.findMany({ orderBy: (t, { asc }) => [asc(t.price)] });
    return plans.map((p) => ({ ...p, features: JSON.parse(p.features) }));
  });
}
