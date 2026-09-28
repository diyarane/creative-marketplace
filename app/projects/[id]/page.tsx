"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Calendar, DollarSign, Tag, ArrowRight, Ban, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { useProject, useProjectFiles } from "@/hooks/use-project";
import { StatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { useToast } from "@/components/ui/toast";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { project, loading, reload } = useProject(id);
  const { files } = useProjectFiles(id);
  const [busy, setBusy] = React.useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium text-ink">Project could not be loaded</p>
        <p className="mt-1 text-sm text-muted">It may not exist, or you may not have permission to view it.</p>
      </div>
    );
  }

  const isOwnerClient = user?.role === "CLIENT" && project.clientId === user.id;
  const isAssignedCreator = user?.role === "CREATOR" && project.creator?.userId === user.id;

  async function publish() {
    setBusy(true);
    try {
      await apiFetch(`/api/projects/${id}/publish`, { method: "POST" });
      toast({ variant: "success", title: "Project published" });
      reload();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not publish" });
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!confirm("Are you sure you want to cancel this project? This cannot be undone.")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/projects/${id}/cancel`, { method: "POST" });
      toast({ variant: "success", title: "Project cancelled" });
      reload();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not cancel" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-semibold text-ink">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-muted">Posted {formatDate(project.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.role === "CREATOR" && ["OPEN", "PROPOSALS_RECEIVED"].includes(project.status) && (
            <Button asChild>
              <Link href={`/projects/${id}/proposal`}>
                Submit a proposal <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          {isOwnerClient && project.status === "DRAFT" && (
            <Button onClick={publish} loading={busy}>
              <Rocket className="size-4" /> Publish project
            </Button>
          )}
          {isOwnerClient && project.status === "PROPOSALS_RECEIVED" && (
            <Button asChild>
              <Link href={`/projects/${id}/proposals`}>
                Review proposals <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          {(isOwnerClient || isAssignedCreator) &&
            ["FREELANCER_SELECTED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED"].includes(project.status) && (
              <Button asChild>
                <Link href={`/projects/${id}/workspace`}>
                  Open workspace <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          {isOwnerClient && project.status === "APPROVED" && (
            <Button asChild>
              <Link href={`/projects/${id}/payment`}>
                Pay creator <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          {(isOwnerClient || isAssignedCreator) && project.status === "COMPLETED" && (
            <Button asChild variant="outline">
              <Link href={`/projects/${id}/review`}>Leave a review</Link>
            </Button>
          )}
          {isOwnerClient && !["COMPLETED", "CANCELLED"].includes(project.status) && (
            <Button variant="ghost" onClick={cancel} loading={busy} className="text-red-600 hover:bg-red-50">
              <Ban className="size-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <DollarSign className="size-5 text-signal" />
            <div>
              <p className="text-xs text-muted">Budget</p>
              <p className="font-semibold text-ink">
                {project.agreedPrice ? formatCurrency(project.agreedPrice) : `${formatCurrency(project.budgetMin)} - ${formatCurrency(project.budgetMax)}`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="size-5 text-signal" />
            <div>
              <p className="text-xs text-muted">Deadline</p>
              <p className="font-semibold text-ink">{formatDate(project.deadline)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Tag className="size-5 text-signal" />
            <div>
              <p className="text-xs text-muted">Category</p>
              <p className="font-semibold text-ink">{project.category}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {project.creator && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4">
          <Avatar name={project.creator.user.name} gradient={project.creator.coverGradient} />
          <div>
            <p className="text-sm font-medium text-ink">{project.creator.user.name}</p>
            <p className="text-xs text-muted">{project.creator.specialization} · Assigned creator</p>
          </div>
          <Link href={`/creator/${project.creator.id}`} className="ml-auto text-xs font-medium text-signal hover:underline">
            View profile
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="font-semibold text-ink">Description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/75">{project.description}</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink">Requirements</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/75">{project.requirements}</p>
        </section>
        {files && files.length > 0 && (
          <section>
            <h2 className="font-semibold text-ink">Files ({files.length})</h2>
            <ul className="mt-2 space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg border border-ink/10 px-3.5 py-2.5 text-sm">
                  <span>{f.fileName}</span>
                  <span className="text-xs text-muted">{f.kind === "REFERENCE" ? "Reference" : "Submission"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
