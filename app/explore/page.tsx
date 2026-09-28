"use client";
import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { apiFetch } from "@/lib/fetcher";
import { CreatorProfileDTO } from "@/types";
import { CreatorCard } from "@/components/explore/creator-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SPECIALIZATIONS } from "@/lib/constants";

function ExploreContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [creators, setCreators] = React.useState<CreatorProfileDTO[] | null>(null);
  const [q, setQ] = React.useState(params.get("q") || "");
  const [showFilters, setShowFilters] = React.useState(false);

  const specialization = params.get("specialization") || "";
  const availability = params.get("availability") || "";
  const sort = params.get("sort") || "rating";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const minRating = params.get("minRating") || "";

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/explore?${next.toString()}`);
  }

  React.useEffect(() => {
    setCreators(null);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (specialization) qs.set("specialization", specialization);
    if (availability) qs.set("availability", availability);
    if (sort) qs.set("sort", sort);
    if (minPrice) qs.set("minPrice", minPrice);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    if (minRating) qs.set("minRating", minRating);
    apiFetch<CreatorProfileDTO[]>(`/api/creators?${qs.toString()}`).then(setCreators);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, specialization, availability, sort, minPrice, maxPrice, minRating]);

  const activeFilterCount = [specialization, availability, minPrice, maxPrice, minRating].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Explore creative talent</h1>
        <p className="mt-2 text-muted">
          Browse {creators?.length ?? "our"} vetted animators, VFX artists, 3D artists, editors, and compositors ready for your next project.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, specialty, or keyword..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="sm:w-auto">
          <SlidersHorizontal className="size-4" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <Select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="sm:w-48">
          <option value="rating">Top rated</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="experience">Most experienced</option>
        </Select>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Specialty</label>
            <Select value={specialization} onChange={(e) => updateParam("specialization", e.target.value)}>
              <option value="">All specialties</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Availability</label>
            <Select value={availability} onChange={(e) => updateParam("availability", e.target.value)}>
              <option value="">Any availability</option>
              <option value="AVAILABLE">Available now</option>
              <option value="BUSY">Busy</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Max hourly rate</label>
            <Input type="number" placeholder="$300" value={maxPrice} onChange={(e) => updateParam("maxPrice", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Minimum rating</label>
            <Select value={minRating} onChange={(e) => updateParam("minRating", e.target.value)}>
              <option value="">Any rating</option>
              <option value="4.5">4.5+</option>
              <option value="4">4.0+</option>
              <option value="3.5">3.5+</option>
            </Select>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => router.push("/explore")}
              className="col-span-full flex items-center gap-1 text-xs font-medium text-signal hover:underline"
            >
              <X className="size-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {creators === null &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        {creators?.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
      </div>

      {creators && creators.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-ink">No creators match your filters</p>
          <p className="mt-1 text-sm text-muted">Try adjusting your search or clearing some filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/explore")}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
