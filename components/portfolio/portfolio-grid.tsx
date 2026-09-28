"use client";
import * as React from "react";
import { Play, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { PortfolioItemDTO } from "@/types";

export function PortfolioGrid({ items }: { items: PortfolioItemDTO[] }) {
  const [active, setActive] = React.useState<PortfolioItemDTO | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 py-16 text-center">
        <p className="text-sm text-muted">No portfolio items yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            <div className={`${item.gradient} absolute inset-0 transition-transform duration-500 group-hover:scale-110`} />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-left text-xs font-medium text-white">{item.title}</p>
            </div>
            <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
              {item.mediaType === "VIDEO" ? <Play className="size-3.5 text-white" /> : <ImageIcon className="size-3.5 text-white" />}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl p-0">
          {active && (
            <>
              <div className={`${active.gradient} relative flex aspect-video items-center justify-center`}>
                {active.mediaType === "VIDEO" && (
                  <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <Play className="size-7 fill-white text-white" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <DialogTitle>{active.title}</DialogTitle>
                <div className="mt-1">
                  <Badge variant="signal">{active.category}</Badge>
                </div>
                <DialogDescription className="mt-3 text-sm leading-relaxed">{active.description}</DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
