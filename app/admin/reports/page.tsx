"use client";
import * as React from "react";
import { apiFetch } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsOverTime, RevenueChart, DistributionPie, CategoryBars, type AdminStats } from "@/components/admin/charts";

export default function AdminReports() {
  const [s, setS] = React.useState<AdminStats | null>(null);
  React.useEffect(() => { apiFetch<AdminStats>("/api/admin/stats").then(setS); }, []);
  if (!s) return <div className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-96 rounded-2xl" /></div>;
  const box = "rounded-2xl border border-ink/10 bg-white p-6";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Reports</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={box}><h2 className="font-semibold">Projects &amp; registrations over time</h2><ProjectsOverTime data={s.months} /></section>
        <section className={box}><h2 className="font-semibold">Transaction volume</h2><RevenueChart data={s.months} /></section>
        <section className={box}><h2 className="font-semibold">Project status distribution</h2><DistributionPie data={s.statusDistribution} /></section>
        <section className={box}><h2 className="font-semibold">Creators by specialty</h2><CategoryBars data={s.categoryBreakdown} /></section>
      </div>
    </div>
  );
}
