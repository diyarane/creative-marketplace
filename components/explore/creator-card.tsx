import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { CreatorProfileDTO } from "@/types";
import { cn } from "@/lib/utils";

export function CreatorCard({ creator }: { creator: CreatorProfileDTO & { portfolioItems?: { gradient: string }[] } }) {
  const items = creator.portfolioItems?.slice(0, 3) || [];
  return (
    <Link
      href={`/creator/${creator.id}`}
      className="group block overflow-hidden rounded-2xl border border-ink/10 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"
    >
      <div className="grid grid-cols-3 gap-0.5 bg-ink/5 p-0.5">
        {(items.length ? items : [{ gradient: creator.coverGradient }, { gradient: creator.coverGradient }, { gradient: creator.coverGradient }]).map(
          (item, i) => (
            <div key={i} className={cn(item.gradient, "aspect-square transition-transform duration-500 group-hover:scale-105")} />
          )
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={creator.user.name} gradient={creator.coverGradient} />
            <div>
              <p className="text-sm font-semibold text-ink">{creator.user.name}</p>
              <p className="text-xs text-muted">{creator.specialization}</p>
            </div>
          </div>
          <Badge variant={creator.availability === "AVAILABLE" ? "success" : creator.availability === "BUSY" ? "warning" : "neutral"}>
            {creator.availability === "AVAILABLE" ? "Available" : creator.availability === "BUSY" ? "Busy" : "Unavailable"}
          </Badge>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-ink/70">{creator.headline}</p>
        <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-ink">{creator.rating.toFixed(1)}</span> ({creator.totalReviews})
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {creator.location}
          </span>
          <span className="font-medium text-ink">${creator.hourlyRate}/hr</span>
        </div>
      </div>
    </Link>
  );
}
