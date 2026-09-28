import { clearSessionCookie } from "@/lib/auth/session";
import { handleRoute } from "@/lib/api-helpers";

export async function POST() {
  return handleRoute(async () => {
    await clearSessionCookie();
    return { ok: true };
  });
}
