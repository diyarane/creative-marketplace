"use client";
import * as React from "react";
import { apiFetch } from "@/lib/fetcher";
import type { CreatorProfileDTO, PortfolioItemDTO, ServiceDTO } from "@/types";

export type OwnProfile = CreatorProfileDTO & { portfolioItems: PortfolioItemDTO[]; services: ServiceDTO[] };

export function useOwnProfile() {
  const [profile, setProfile] = React.useState<OwnProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const reload = React.useCallback(async () => {
    try {
      setProfile(await apiFetch<OwnProfile>("/api/creators/profile"));
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    reload();
  }, [reload]);
  return { profile, loading, reload };
}
