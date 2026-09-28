import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations/auth";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { setSessionCookie } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = loginSchema.parse(await req.json());

    const user = await db.query.users.findFirst({ where: eq(users.email, body.email) });
    if (!user) throw new AppError("Invalid email or password.", 401);
    if (!user.active) throw new AppError("This account has been deactivated. Contact support.", 403);

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password.", 401);

    await setSessionCookie({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  });
}
