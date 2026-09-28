"use client";
import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileText, Upload, MessageCircle, CheckCircle2, AlertCircle, PlayCircle, Send } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { useProject, useProjectFiles, useProjectRevisions } from "@/hooks/use-project";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { StatusBadge } from "@/components/projects/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { project, loading, reload } = useProject(id);
  const { files, reload: reloadFiles } = useProjectFiles(id);
  const { revisions, reload: reloadRevisions } = useProjectRevisions(id);
  const [busy, setBusy] = React.useState(false);
  const [revisionNote, setRevisionNote] = React.useState("");
  const [submitNote, setSubmitNote] = React.useState("");
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [submitOpen, setSubmitOpen] = React.useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium text-ink">Project could not be loaded</p>
      </div>
    );
  }

  const isClient = user?.role === "CLIENT" && project.clientId === user.id;
  const isCreator = user?.role === "CREATOR" && project.creator?.userId === user.id;

  async function refreshAll() {
    await Promise.all([reload(), reloadFiles(), reloadRevisions()]);
  }

  async function startWork() {
    setBusy(true);
    try {
      await apiFetch(`/api/projects/${id}/start`, { method: "POST" });
      toast({ variant: "success", title: "Project started" });
      refreshAll();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not start project" });
    } finally {
      setBusy(false);
    }
  }

  async function submitWork() {
    if (!submitNote.trim()) {
      toast({ variant: "error", title: "Add a short note describing what you're submitting" });
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/api/projects/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ fileName: `final-delivery-v${(files?.filter((f) => f.kind === "SUBMISSION").length || 0) + 1}.mp4`, note: submitNote }),
      });
      toast({ variant: "success", title: "Work submitted", description: "The client has been notified." });
      setSubmitNote("");
      setSubmitOpen(false);
      refreshAll();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not submit work" });
    } finally {
      setBusy(false);
    }
  }

  async function requestRevision() {
    if (revisionNote.trim().length < 10) {
      toast({ variant: "error", title: "Describe what needs to change (at least 10 characters)" });
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/api/projects/${id}/revisions`, { method: "POST", body: JSON.stringify({ description: revisionNote }) });
      toast({ variant: "success", title: "Revision requested" });
      setRevisionNote("");
      setRevisionOpen(false);
      refreshAll();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not request revision" });
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    try {
      await apiFetch(`/api/projects/${id}/approve`, { method: "POST" });
      toast({ variant: "success", title: "Work approved" });
      refreshAll();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not approve" });
    } finally {
      setBusy(false);
    }
  }

  const otherParty = isClient ? project.creator?.user : project.client;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/projects/${id}`} className="text-xs font-medium text-signal hover:underline">
            ← Back to project
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-ink">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
        </div>
        {otherParty && (
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-4">
            <Avatar name={otherParty.name} gradient={otherParty.avatar} size="sm" />
            <div>
              <p className="text-xs font-medium text-ink">{otherParty.name}</p>
            </div>
            <Link href={`/messages?with=${otherParty.id}`} className="ml-2 text-muted hover:text-signal">
              <MessageCircle className="size-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Creator: start work CTA */}
      {isCreator && project.status === "FREELANCER_SELECTED" && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-signal/30 bg-signal/5 p-5">
          <div>
            <p className="font-medium text-ink">You&apos;ve been assigned this project</p>
            <p className="text-sm text-muted">Agreed price: {formatCurrency(project.agreedPrice || 0)} · Start when you&apos;re ready to begin.</p>
          </div>
          <Button onClick={startWork} loading={busy}>
            <PlayCircle className="size-4" /> Start work
          </Button>
        </div>
      )}

      {/* Creator: submit work CTA */}
      {isCreator && ["IN_PROGRESS", "REVISION_REQUESTED"].includes(project.status) && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-5">
          <div>
            <p className="font-medium text-ink">Ready to submit your work?</p>
            <p className="text-sm text-muted">The client will be notified to review and approve.</p>
          </div>
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="size-4" /> Submit work
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit completed work</DialogTitle>
                <DialogDescription>Describe what you&apos;re delivering. A file will be attached to this submission.</DialogDescription>
              </DialogHeader>
              <Textarea rows={4} placeholder="e.g. Final cut with color grade and captions burned in..." value={submitNote} onChange={(e) => setSubmitNote(e.target.value)} />
              <div className="mt-4 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={submitWork} loading={busy}>
                  <Send className="size-4" /> Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Client: review submission CTA */}
      {isClient && project.status === "SUBMITTED" && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="font-medium text-ink">New work submitted — review and decide</p>
          <p className="mt-1 text-sm text-muted">Approve to proceed to payment, or request a revision with specific feedback.</p>
          <div className="mt-4 flex gap-2">
            <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <AlertCircle className="size-4" /> Request revision
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request a revision</DialogTitle>
                  <DialogDescription>Be specific about what should change — this goes directly to the creator.</DialogDescription>
                </DialogHeader>
                <Textarea rows={4} placeholder="e.g. The particle effects feel too dense — please pull them back about 40%..." value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} />
                <div className="mt-4 flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button onClick={requestRevision} loading={busy}>
                    Send request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={approve} loading={busy}>
              <CheckCircle2 className="size-4" /> Approve work
            </Button>
          </div>
        </div>
      )}

      {isClient && project.status === "APPROVED" && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-success/30 bg-success/5 p-5">
          <p className="font-medium text-ink">Work approved — payment is the next step</p>
          <Button asChild>
            <Link href={`/projects/${id}/payment`}>Pay creator</Link>
          </Button>
        </div>
      )}

      {/* Revisions */}
      {revisions && revisions.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold text-ink">Revision history</h2>
          <div className="mt-3 space-y-3">
            {revisions.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{formatDateTime(r.createdAt)}</span>
                  <StatusBadgeForRevision status={r.status} />
                </div>
                <p className="mt-2 text-sm text-ink/80">{r.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Files */}
      <section className="mt-8">
        <h2 className="font-semibold text-ink">Files & submissions</h2>
        {!files || files.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No files uploaded yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-ink">{f.fileName}</p>
                    {f.note && <p className="text-xs text-muted">{f.note}</p>}
                  </div>
                </div>
                <span className="text-xs font-medium text-muted">{f.kind === "REFERENCE" ? "Reference" : "Submission"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadgeForRevision({ status }: { status: "OPEN" | "RESOLVED" }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status === "OPEN" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
      {status === "OPEN" ? "Open" : "Resolved"}
    </span>
  );
}
