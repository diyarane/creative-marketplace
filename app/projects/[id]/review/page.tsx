"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { useProject } from "@/hooks/use-project";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import type { ReviewDTO } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { project, loading } = useProject(id);
  const [reviews, setReviews] = React.useState<ReviewDTO[] | null>(null);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    apiFetch<ReviewDTO[]>(`/api/projects/${id}/reviews`).then(setReviews);
  }, [id]);

  if (loading || reviews === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium text-ink">Project could not be loaded</p>
      </div>
    );
  }

  const myReview = reviews.find((r) => r.reviewerId === user?.id);
  const revieweeName = user?.role === "CLIENT" ? project.creator?.user.name : project.client?.name;

  async function submit() {
    if (comment.trim().length < 10) {
      toast({ variant: "error", title: "Comment must be at least 10 characters" });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/projects/${id}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) });
      toast({ variant: "success", title: "Review submitted" });
      const fresh = await apiFetch<ReviewDTO[]>(`/api/projects/${id}/reviews`);
      setReviews(fresh);
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not submit review" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Leave a review</h1>
      <p className="mt-1 text-sm text-muted">{project.title}</p>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6">
        {myReview ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="size-12 text-success" />
            <p className="mt-4 font-semibold text-ink">You already reviewed this project</p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("size-5", i < myReview.rating ? "fill-amber-400 text-amber-400" : "text-ink/15")} />
              ))}
            </div>
            <p className="mt-3 max-w-sm text-sm text-ink/70">{myReview.comment}</p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href={`/projects/${id}`}>Back to project</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-ink">Rate your experience with {revieweeName}</p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}>
                  <Star className={cn("size-8 transition-colors", i < rating ? "fill-amber-400 text-amber-400" : "text-ink/15 hover:text-amber-300")} />
                </button>
              ))}
            </div>
            <div className="mt-5">
              <Textarea rows={5} placeholder="Share details about the collaboration, communication, and quality of work..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <Button className="mt-5 w-full" size="lg" onClick={submit} loading={submitting}>
              Submit review
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
