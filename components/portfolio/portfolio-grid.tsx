"use client";

import * as React from "react";
import { Play, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { PortfolioItemDTO } from "@/types";
import {
  resolvePortfolioItemImage,
  getSpecializationPortfolioImages,
  getImagePresentation,
} from "@/lib/portfolio-images";

interface PortfolioGridProps {
  items: PortfolioItemDTO[];
  specialization?: string;
}

export function PortfolioGrid({ items, specialization }: PortfolioGridProps) {
  const [active, setActive] = React.useState<PortfolioItemDTO | null>(null);

  // If items exist, use them. If no items are in the DB, fallback to the 3 specialization portfolio images.
  const fallbackImages = getSpecializationPortfolioImages(specialization);
  const displayItems =
    items && items.length > 0
      ? items
      : fallbackImages.map((img, i) => ({
          id: `preview-${i}`,
          creatorId: "",
          title: `Featured ${specialization || "Creative"} Study 0${i + 1}`,
          description: `A visual exploration in ${specialization?.toLowerCase() || "motion craft"} emphasizing rhythm, light, and composition.`,
          category: specialization || "Creative Craft",
          mediaType: i % 2 === 1 ? ("VIDEO" as const) : ("IMAGE" as const),
          thumbnailUrl: img,
          mediaUrl: img,
          gradient: `gradient-${i + 1}`,
          createdAt: new Date(),
        }));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {displayItems.map((item, i) => {
          const imgUrl = resolvePortfolioItemImage(
            item,
            specialization || item.category,
            i
          );
          return (
            <button
              key={item.id}
              onClick={() => setActive(item as PortfolioItemDTO)}
              className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-ink/10 bg-ink/5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal cursor-pointer"
            >
              <img
                src={imgUrl}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay for contrast and legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end transition-opacity">
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-white/70 line-clamp-1">
                  {item.category}
                </p>
              </div>

              {/* Media type badge */}
              <div className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-md">
                {item.mediaType === "VIDEO" ? (
                  <Play className="size-3.5 fill-white text-white" />
                ) : (
                  <ImageIcon className="size-3.5 text-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {active && (() => {
            const activeImgUrl = resolvePortfolioItemImage(
              active,
              specialization || active.category
            );
            const pres = getImagePresentation(activeImgUrl);
            return (
              <>
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-black">
                  {pres.useAmbientBackdrop ? (
                    <>
                      <img
                        src={activeImgUrl}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 size-full scale-125 object-cover opacity-35 blur-xl"
                      />
                      <img
                        src={activeImgUrl}
                        alt={active.title}
                        className="relative z-10 max-h-full max-w-full object-contain p-2"
                      />
                    </>
                  ) : (
                    <img
                      src={activeImgUrl}
                      alt={active.title}
                      style={{ objectPosition: pres.position }}
                      className="size-full object-cover"
                    />
                  )}
                  {active.mediaType === "VIDEO" && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/25">
                      <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-transform group-hover:scale-110">
                        <Play className="size-7 fill-white text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <DialogTitle className="font-display text-xl font-semibold text-ink">
                    {active.title}
                  </DialogTitle>
                  <div className="mt-2">
                    <Badge variant="signal">{active.category}</Badge>
                  </div>
                  <DialogDescription className="mt-3 text-sm leading-relaxed text-ink/75">
                    {active.description}
                  </DialogDescription>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
