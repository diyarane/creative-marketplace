import { db } from "@/lib/db";
import { users, creatorProfiles } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validations/auth";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { setSessionCookie } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { GRADIENTS } from "@/lib/constants";
import { getSettings } from "@/lib/services/settings";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = registerSchema.parse(await req.json());
    if ((await getSettings()).allowRegistrations !== "true") throw new AppError("New registrations are currently disabled.", 403);

    const existing = await db.query.users.findFirst({ where: eq(users.email, body.email) });
    if (existing) throw new AppError("An account with this email already exists.", 409);

    const passwordHash = await bcrypt.hash(body.password, 10);
    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

    const [user] = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        passwordHash,
        role: body.role,
        avatar: gradient,
      })
      .returning();

    if (body.role === "CREATOR") {
      await db.insert(creatorProfiles).values({
        userId: user.id,
        headline: "New creative professional",
        bio: "This creator hasn't written a bio yet.",
        specialization: "Motion Designer",
        location: "Remote",
        experience: 0,
        hourlyRate: 50,
        availability: "AVAILABLE",
        coverGradient: gradient,
      });
    }

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
