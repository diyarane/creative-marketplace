import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { ReviewList } from "@/components/creator/review-list";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") redirect("/unauthorized");
  const rows = await db.query.reviews.findMany({ where: eq(reviews.reviewedUserId, session.userId), with: { reviewer: true }, orderBy: [desc(reviews.createdAt)] });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Reviews</h1>
      <p className="mt-1 text-sm text-muted">What clients say about working with you.</p>
      <div className="mt-8"><ReviewList reviews={rows} /></div>
    </div>
  );
}
