import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, desc, inArray } from "drizzle-orm";
import { Briefcase, Inbox, CheckCircle2, DollarSign, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { projects, proposals, payments, notifications, creatorProfiles } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/projects/status-badge";
import { CreatorCard } from "@/components/explore/creator-card";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
const ACTIVE = ["OPEN", "PROPOSALS_RECEIVED", "FREELANCER_SELECTED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "APPROVED", "PAYMENT_PENDING"];

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") redirect("/unauthorized");

  const myProjects = await db.query.projects.findMany({
    where: eq(projects.clientId, session.userId),
    orderBy: [desc(projects.updatedAt)],
  });
  const ids = myProjects.map((p) => p.id);
  const pendingProposals = ids.length
    ? await db.query.proposals.findMany({ where: and(inArray(proposals.projectId, ids), eq(proposals.status, "PENDING")) })
    : [];
  const myPayments = await db.query.payments.findMany({ where: and(eq(payments.clientId, session.userId), eq(payments.status, "SUCCEEDED")) });
  const spent = myPayments.reduce((s, p) => s + p.amount, 0);
  const active = myProjects.filter((p) => ACTIVE.includes(p.status));
  const completed = myProjects.filter((p) => p.status === "COMPLETED");
  const deadlines = active.filter((p) => new Date(p.deadline).getTime() > Date.now()).sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline)).slice(0, 4);
  const recent = await db.query.notifications.findMany({ where: eq(notifications.userId, session.userId), orderBy: [desc(notifications.createdAt)], limit: 5 });
  const recommended = await db.query.creatorProfiles.findMany({
    with: { user: true, portfolioItems: { limit: 3 } },
    orderBy: [desc(creatorProfiles.rating)],
    limit: 3,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Welcome back, {session.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening across your projects.</p>
        </div>
        <Button asChild>
          <Link href="/project/new"><Plus className="size-4" /> New project</Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active projects" value={active.length} icon={Briefcase} />
        <StatCard label="Pending proposals" value={pendingProposals.length} icon={Inbox} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} />
        <StatCard label="Total spent" value={formatCurrency(spent)} icon={DollarSign} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-ink/10 bg-white p-6 lg:col-span-2">
          <h2 className="font-semibold text-ink">Active projects</h2>
          {active.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No active projects. <Link href="/project/new" className="text-signal hover:underline">Post one now.</Link></p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/8">
              {active.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <div>
                      <p className="text-sm font-medium text-ink">{p.title}</p>
                      <p className="text-xs text-muted">Due {formatDate(p.deadline)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6">
          <h2 className="font-semibold text-ink">Upcoming deadlines</h2>
          {deadlines.length === 0 ? <p className="mt-4 text-sm text-muted">No upcoming deadlines.</p> : (
            <ul className="mt-4 space-y-3">
              {deadlines.map((p) => (
                <li key={p.id} className="text-sm">
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-muted">{formatDate(p.deadline)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6 lg:col-span-3">
          <h2 className="font-semibold text-ink">Recent activity</h2>
          {recent.length === 0 ? <p className="mt-4 text-sm text-muted">No recent activity.</p> : (
            <ul className="mt-4 divide-y divide-ink/8">
              {recent.map((n) => (
                <li key={n.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span><span className="font-medium text-ink">{n.title}</span> <span className="text-muted">— {n.message}</span></span>
                  <span className="shrink-0 pl-3 text-xs text-muted">{timeAgo(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Recommended creators</h2>
          <Link href="/explore" className="text-sm font-medium text-signal hover:underline">Browse all</Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {recommended.map((c) => (
            <CreatorCard key={c.id} creator={JSON.parse(JSON.stringify({ ...c, user: { ...c.user, passwordHash: undefined } }))} />
          ))}
        </div>
      </section>
    </div>
  );
}
