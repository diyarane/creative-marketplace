"use client";
import * as React from "react";
import { Users, Palette, Briefcase, CheckCircle2, DollarSign, Clock } from "lucide-react";
import { apiFetch } from "@/lib/fetcher";
import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsOverTime, RevenueChart, DistributionPie, type AdminStats } from "@/components/admin/charts";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";

interface Full extends AdminStats {
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
  recentPayments: { id: string; amount: number; status: string; createdAt: string; project: { title: string } }[];
}

export default function AdminOverview() {
  const [s, setS] = React.useState<Full | null>(null);
  React.useEffect(() => { apiFetch<Full>("/api/admin/stats").then(setS); }, []);
  if (!s) return <div className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-96 rounded-2xl" /></div>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Platform overview</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Users" value={s.totalUsers} icon={Users} />
        <StatCard label="Creators" value={s.totalCreators} icon={Palette} />
        <StatCard label="Active projects" value={s.activeProjects} icon={Briefcase} />
        <StatCard label="Completed" value={s.completedProjects} icon={CheckCircle2} />
        <StatCard label="Pending" value={s.pendingProjects} icon={Clock} />
        <StatCard label="Volume" value={formatCurrency(s.transactionValue)} icon={DollarSign} />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-ink/10 bg-white p-6 lg:col-span-2"><h2 className="font-semibold">Projects &amp; registrations</h2><ProjectsOverTime data={s.months} /></section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6"><h2 className="font-semibold">Status distribution</h2><DistributionPie data={s.statusDistribution} /></section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6"><h2 className="font-semibold">Recent registrations</h2>
          <ul className="mt-4 divide-y divide-ink/8">{s.recentUsers.map((u) => <li key={u.id} className="flex justify-between py-2.5 text-sm"><span>{u.name} <span className="text-xs text-muted">({u.role.toLowerCase()})</span></span><span className="text-xs text-muted">{timeAgo(u.createdAt)}</span></li>)}</ul></section>
        <section className="rounded-2xl border border-ink/10 bg-white p-6 lg:col-span-2"><h2 className="font-semibold">Recent payments</h2>
          {s.recentPayments.length === 0 ? <p className="mt-4 text-sm text-muted">No payments yet.</p> : <ul className="mt-4 divide-y divide-ink/8">{s.recentPayments.map((p) => <li key={p.id} className="flex justify-between py-2.5 text-sm"><span>{p.project.title}</span><span className="text-muted">{formatCurrency(p.amount)} · {p.status.toLowerCase()} · {formatDate(p.createdAt)}</span></li>)}</ul>}</section>
      </div>
    </div>
  );
}
