"use client";
import * as React from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { apiFetch } from "@/lib/fetcher";
import { ProjectDTO } from "@/types";
import { StatusBadge } from "@/components/projects/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ACTIVE_STATUSES = ["OPEN", "PROPOSALS_RECEIVED", "FREELANCER_SELECTED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED", "APPROVED", "PAYMENT_PENDING"];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = React.useState<ProjectDTO[] | null>(null);

  React.useEffect(() => {
    apiFetch<ProjectDTO[]>("/api/projects").then(setProjects).catch(() => setProjects([]));
  }, []);

  const active = projects?.filter((p) => ACTIVE_STATUSES.includes(p.status)) || [];
  const drafts = projects?.filter((p) => p.status === "DRAFT") || [];
  const completed = projects?.filter((p) => p.status === "COMPLETED") || [];
  const cancelled = projects?.filter((p) => p.status === "CANCELLED") || [];

  function ProjectRow({ p }: { p: ProjectDTO }) {
    return (
      <Link
        href={`/projects/${p.id}`}
        className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink">{p.title}</p>
            <StatusBadge status={p.status} />
          </div>
          <p className="mt-1 text-xs text-muted">
            {p.category} · Deadline {formatDate(p.deadline)}
            {typeof p.proposalCount === "number" && p.proposalCount > 0 && ` · ${p.proposalCount} proposal${p.proposalCount > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-ink">
            {p.agreedPrice ? formatCurrency(p.agreedPrice) : `${formatCurrency(p.budgetMin)} – ${formatCurrency(p.budgetMax)}`}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {user?.role === "CREATOR" ? "My Assigned Projects" : "My Projects"}
          </h1>
          <p className="mt-1 text-sm text-muted">Track every project from proposal to payment.</p>
        </div>
        {user?.role === "CLIENT" && (
          <Button asChild>
            <Link href="/project/new">
              <Plus className="size-4" /> New project
            </Link>
          </Button>
        )}
      </div>

      {projects === null ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={FolderOpen}
            title={user?.role === "CREATOR" ? "No assigned projects yet" : "No projects yet"}
            description={
              user?.role === "CREATOR"
                ? "Browse open opportunities and submit a proposal to get started."
                : "Post your first project to start receiving proposals from creators."
            }
          />
        </div>
      ) : (
        <Tabs defaultValue="active" className="mt-8">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            {user?.role === "CLIENT" && <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>}
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-3">
            {active.length === 0 ? <EmptyState icon={FolderOpen} title="No active projects" /> : active.map((p) => <ProjectRow key={p.id} p={p} />)}
          </TabsContent>
          {user?.role === "CLIENT" && (
            <TabsContent value="drafts" className="space-y-3">
              {drafts.length === 0 ? <EmptyState icon={FolderOpen} title="No drafts" /> : drafts.map((p) => <ProjectRow key={p.id} p={p} />)}
            </TabsContent>
          )}
          <TabsContent value="completed" className="space-y-3">
            {completed.length === 0 ? <EmptyState icon={FolderOpen} title="No completed projects yet" /> : completed.map((p) => <ProjectRow key={p.id} p={p} />)}
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-3">
            {cancelled.length === 0 ? <EmptyState icon={FolderOpen} title="No cancelled projects" /> : cancelled.map((p) => <ProjectRow key={p.id} p={p} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
