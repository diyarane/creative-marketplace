import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { getSettings, setSetting } from "@/lib/services/settings";
import { z } from "zod";

const schema = z.object({
  platformFeeRate: z.coerce.number().min(0).max(0.5),
  allowRegistrations: z.boolean(),
});

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return getSettings();
  });
}

export async function PUT(req: Request) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const body = schema.parse(await req.json());
    await setSetting("platformFeeRate", String(body.platformFeeRate));
    await setSetting("allowRegistrations", String(body.allowRegistrations));
    return getSettings();
  });
}
