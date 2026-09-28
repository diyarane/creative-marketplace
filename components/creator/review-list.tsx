import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ReviewWithReviewer {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  reviewer: { name: string; avatar: string };
}

export function ReviewList({ reviews }: { reviews: ReviewWithReviewer[] }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 py-12 text-center">
        <p className="text-sm text-muted">No reviews yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-2xl border border-ink/10 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={r.reviewer.name} gradient={r.reviewer.avatar} size="sm" />
              <div>
                <p className="text-sm font-medium text-ink">{r.reviewer.name}</p>
                <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink/15"}`} />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/75">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
