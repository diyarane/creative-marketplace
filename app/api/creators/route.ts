import { db } from "@/lib/db";
import { creatorProfiles, users } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { and, eq, gte, lte, like, desc, asc } from "drizzle-orm";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const specialization = searchParams.get("specialization");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minRating = searchParams.get("minRating");
    const availability = searchParams.get("availability");
    const sort = searchParams.get("sort") || "rating";

    const conditions = [];
    if (specialization) conditions.push(eq(creatorProfiles.specialization, specialization));
    if (minPrice) conditions.push(gte(creatorProfiles.hourlyRate, Number(minPrice)));
    if (maxPrice) conditions.push(lte(creatorProfiles.hourlyRate, Number(maxPrice)));
    if (minRating) conditions.push(gte(creatorProfiles.rating, Number(minRating)));
    if (availability) conditions.push(eq(creatorProfiles.availability, availability as "AVAILABLE" | "BUSY" | "UNAVAILABLE"));

    const orderBy =
      sort === "price_asc"
        ? asc(creatorProfiles.hourlyRate)
        : sort === "price_desc"
        ? desc(creatorProfiles.hourlyRate)
        : sort === "experience"
        ? desc(creatorProfiles.experience)
        : desc(creatorProfiles.rating);

    let rows = await db.query.creatorProfiles.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { user: true, portfolioItems: { limit: 3 }, services: { limit: 3 } },
      orderBy: [orderBy],
    });

    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.user.name.toLowerCase().includes(needle) ||
          r.headline.toLowerCase().includes(needle) ||
          r.specialization.toLowerCase().includes(needle)
      );
    }

    return rows.map((r) => ({ ...r, user: { ...r.user, passwordHash: undefined } }));
  });
}
