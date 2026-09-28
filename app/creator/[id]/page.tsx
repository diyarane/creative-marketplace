import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { creatorProfiles, reviews as reviewsTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Star, MapPin, Clock, BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { ServiceList } from "@/components/creator/service-list-public";
import { ReviewList } from "@/components/creator/review-list";
import { HireCta } from "@/components/creator/hire-cta";

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const creator = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.id, id),
    with: {
      user: true,
      portfolioItems: { orderBy: (t, { desc }) => [desc(t.createdAt)] },
      services: true,
    },
  });

  if (!creator) notFound();

  const creatorReviews = await db.query.reviews.findMany({
    where: eq(reviewsTable.reviewedUserId, creator.userId),
    with: { reviewer: true },
    orderBy: [desc(reviewsTable.createdAt)],
  });

  const completedProjectsCount = creatorReviews.length; // proxy metric for the profile header

  return (
    <div>
      <section className={`${creator.coverGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%)" }} />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
            <Avatar name={creator.user.name} gradient="bg-white/20" size="xl" className="border-4 border-white/30 backdrop-blur" />
            <div className="flex-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-semibold sm:text-4xl">{creator.user.name}</h1>
                <BadgeCheck className="size-6 text-white/90" />
              </div>
              <p className="mt-1 text-lg text-white/85">{creator.headline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-amber-300 text-amber-300" />
                  <strong className="text-white">{creator.rating.toFixed(1)}</strong> ({creator.totalReviews} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {creator.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" /> {creator.experience} years experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-12 lg:col-span-2">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink">About</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/75">{creator.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="signal">{creator.specialization}</Badge>
              <Badge variant={creator.availability === "AVAILABLE" ? "success" : "warning"}>
                {creator.availability === "AVAILABLE" ? "Available for new projects" : creator.availability === "BUSY" ? "Currently booked" : "Unavailable"}
              </Badge>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Portfolio</h2>
            <div className="mt-4">
              <PortfolioGrid items={creator.portfolioItems} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Services</h2>
            <div className="mt-4">
              <ServiceList services={creator.services} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink">Reviews ({creatorReviews.length})</h2>
            <div className="mt-4">
              <ReviewList reviews={creatorReviews} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <HireCta creator={creator} />
        </aside>
      </div>
    </div>
  );
}
