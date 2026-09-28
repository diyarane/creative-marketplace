import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, desc, or } from "drizzle-orm";
import { Briefcase, Inbox, DollarSign, Star } from "lucide-react";
import { db } from "@/lib/db";
import { projects, proposals, payments, notifications, creatorProfiles, reviews } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/projects/status-badge";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
const ACTIVE = ["FREELANCER_SELECTED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "APPROVED", "PAYMENT_PENDING"];

export default async function CreatorDashboard() {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") redirect("/unauthorized");

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, session.userId),
    with: { portfolioItems: true, services: true },
  });
  if (!profile) redirect("/creator/profile");

  const mine = await db.query.projects.findMany({ where: eq(projects.creatorId, profile.id), orderBy: [desc(projects.updatedAt)] });
  const active = mine.filter((p) => ACTIVE.includes(p.status));
  const pending = await db.query.proposals.findMany({ where: and(eq(proposals.creatorId, profile.id), eq(proposals.status, "PENDING")), with: { project: true } });
  const paid = await db.query.payments.findMany({ where: and(eq(payments.creatorId, profile.id), eq(payments.status, "SUCCEEDED")) });
  const earnings = paid.reduce((s, p) => s + (p.amount - p.platformFee), 0);
  const recentReviews = await db.query.reviews.findMany({ where: eq(reviews.reviewedUserId, session.userId), with: { reviewer: true }, orderBy: [desc(reviews.createdAt)], limit: 3 });
  const opportunities = await db.query.projects.findMany({
    where: or(eq(projects.status, "OPEN"), eq(projects.status, "PROPOSALS_RECEIVED")),
    orderBy: [desc(projects.createdAt)],
    limit: 4,
  });
  const recent = await db.query.notifications.findMany({ where: eq(notifications.userId, session.userId), orderBy: [desc(notifications.createdAt)], limit: 4 });

  const checks = [
    profile.bio.length > 60,
    profile.headline.length > 10,
    profile.portfolioItems.length >= 3,
    profile.services.length >= 1,
    profile.hourlyRate > 0,
  ];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Welcome back, {session.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-muted">Your studio at a glance.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active projects" value={active.length} icon={Briefcase} />
        <StatCard label="Pending proposals" value={pending.length} icon={Inbox} />
        <StatCard label="Net earnings" value={formatCurrency(earnings)} icon={DollarSign} hint="After 10% platform fee" />
        <StatCard label="Rating" value={profile.rating ? profile.rating.toFixed(1) : "—"} icon={Star} hint={`${profile.totalReviews} reviews`} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-ink/10 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold text-ink">Active projects</h2>
          {active.length === 0 ? <p className="mt-4 text-sm text-muted">No active projects. Find one in <Link href="/projects/opportunities" className="text-signal hover:underline">opportunities</Link>.</p> : (
            <ul className="mt-4 divide-y divide-ink/8">
              {active.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}/workspace`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <div>
                      <p className="text-sm font-medium text-ink">{p.title}</p>
                      <p className="text-xs text-muted">Due {formatDate(p.deadline)} · {formatCurrency(p.agreedPrice || 0)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="font-semibold text-ink">Profile completion</h2>
          <p className="mt-3 text-3xl font-semibold">{completion}%</p>
          <Progress value={completion} className="mt-3" />
          {completion < 100 && <Link href="/creator/profile" className="mt-4 inline-block text-sm font-medium text-signal hover:underline">Complete your profile</Link>}
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="font-semibold text-ink">Pending proposals</h2>
          {pending.length === 0 ? <p className="mt-4 text-sm text-muted">No pending proposals.</p> : (
            <ul className="mt-4 space-y-3">
              {pending.map((p) => (
                <li key={p.id} className="text-sm"><p className="font-medium text-ink">{p.project.title}</p><p className="text-xs text-muted">{formatCurrency(p.price)} · {p.deliveryDays} days</p></li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="font-semibold text-ink">Recent reviews</h2>
          {recentReviews.length === 0 ? <p className="mt-4 text-sm text-muted">No reviews yet.</p> : (
            <ul className="mt-4 space-y-3">
              {recentReviews.map((r) => (
                <li key={r.id} className="text-sm"><p className="text-xs font-medium text-amber-600">{"★".repeat(r.rating)}</p><p className="line-clamp-2 text-ink/75">{r.comment}</p><p className="text-xs text-muted">— {r.reviewer.name}</p></li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="font-semibold text-ink">Recent notifications</h2>
          {recent.length === 0 ? <p className="mt-4 text-sm text-muted">No notifications.</p> : (
            <ul className="mt-4 space-y-3">
              {recent.map((n) => (<li key={n.id} className="text-sm"><p className="font-medium text-ink">{n.title}</p><p className="text-xs text-muted">{timeAgo(n.createdAt)}</p></li>))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Available opportunities</h2>
            <Link href="/projects/opportunities" className="text-sm font-medium text-signal hover:underline">See all</Link>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {opportunities.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="block rounded-xl border border-ink/10 p-4 hover:shadow-md">
                  <p className="text-sm font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-muted">{p.category} · {formatCurrency(p.budgetMin)} – {formatCurrency(p.budgetMax)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
