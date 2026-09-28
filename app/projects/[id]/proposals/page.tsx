"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, Clock, RefreshCw, MessageSquareText, Check, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { ProposalDTO } from "@/types";
import { useProject } from "@/hooks/use-project";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export default function ProposalsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { project } = useProject(id);
  const [proposals, setProposals] = React.useState<ProposalDTO[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const data = await apiFetch<ProposalDTO[]>(`/api/projects/${id}/proposals`);
    setProposals(data);
  }, [id]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function accept(proposalId: string) {
    setBusyId(proposalId);
    try {
      await apiFetch(`/api/proposals/${proposalId}/accept`, { method: "POST" });
      toast({ variant: "success", title: "Proposal accepted", description: "The project has been assigned." });
      router.push(`/projects/${id}/workspace`);
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not accept proposal" });
    } finally {
      setBusyId(null);
    }
  }

  async function reject(proposalId: string) {
    setBusyId(proposalId);
    try {
      await apiFetch(`/api/proposals/${proposalId}/reject`, { method: "POST" });
      toast({ variant: "info", title: "Proposal declined" });
      load();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not decline proposal" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted">{project?.title}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Proposals</h1>
      <p className="mt-1 text-sm text-muted">Compare creators and select who you&apos;d like to work with.</p>

      <div className="mt-8 space-y-4">
        {proposals === null &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}

        {proposals?.length === 0 && (
          <EmptyState icon={Inbox} title="No proposals yet" description="Check back soon — creators are notified as soon as your project goes live." />
        )}

        {proposals?.map((p) => (
          <div key={p.id} className={cn("rounded-2xl border bg-white p-5", p.status === "ACCEPTED" ? "border-success" : p.status === "REJECTED" ? "border-ink/10 opacity-60" : "border-ink/10")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={p.creator!.user.name} gradient={p.creator!.coverGradient} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/creator/${p.creator!.id}`} className="font-semibold text-ink hover:underline">
                      {p.creator!.user.name}
                    </Link>
                    {p.status !== "PENDING" && (
                      <Badge variant={p.status === "ACCEPTED" ? "success" : "neutral"}>{p.status === "ACCEPTED" ? "Accepted" : "Declined"}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted">{p.creator!.specialization}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <Star className="size-3 fill-amber-400 text-amber-400" /> {p.creator!.rating.toFixed(1)} ({p.creator!.totalReviews} reviews)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-ink">{formatCurrency(p.price)}</p>
                <p className="flex items-center justify-end gap-1 text-xs text-muted">
                  <Clock className="size-3.5" /> {p.deliveryDays} days
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-ink/75">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted" /> {p.message}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4">
              <span className="flex items-center gap-1 text-xs text-muted">
                <RefreshCw className="size-3.5" /> {p.revisionsIncluded} revisions included
              </span>
              {p.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => reject(p.id)} loading={busyId === p.id}>
                    <X className="size-3.5" /> Decline
                  </Button>
                  <Button size="sm" onClick={() => accept(p.id)} loading={busyId === p.id}>
                    <Check className="size-3.5" /> Accept
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
