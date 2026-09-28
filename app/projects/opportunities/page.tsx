"use client";
import * as React from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { apiFetch } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { Inbox } from "lucide-react";
import type { ProjectDTO } from "@/types";

type Opportunity = ProjectDTO & { hasProposed: boolean };

export default function OpportunitiesPage() {
  const [projects, setProjects] = React.useState<Opportunity[] | null>(null);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    apiFetch<Opportunity[]>("/api/projects/opportunities").then(setProjects).catch(() => setProjects([]));
  }, []);

  const filtered = projects?.filter(
    (p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Project opportunities</h1>
      <p className="mt-1 text-sm text-muted">Browse open projects and submit proposals to win new work.</p>

      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search opportunities..." className="pl-10" />
      </div>

      <div className="mt-6 space-y-3">
        {projects === null && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        {filtered?.length === 0 && <EmptyState icon={Inbox} title="No open opportunities right now" description="Check back soon — new projects are posted regularly." />}
        {filtered?.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-2xl border border-ink/10 bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{p.title}</p>
                  {p.hasProposed && <Badge variant="signal">Proposal sent</Badge>}
                </div>
                <p className="mt-1 text-xs text-muted">
                  {p.category} · Posted {timeAgo(p.createdAt)} · Due {formatDate(p.deadline)}
                </p>
              </div>
              <p className="font-semibold text-ink">
                {formatCurrency(p.budgetMin)} – {formatCurrency(p.budgetMax)}
              </p>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-ink/70">{p.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
