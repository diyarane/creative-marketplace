"use client";
import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/fetcher";
import { DataTable } from "@/components/admin/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreatorProfileDTO } from "@/types";

export default function AdminCreators() {
  const [rows, setRows] = React.useState<CreatorProfileDTO[] | null>(null);
  React.useEffect(() => { apiFetch<CreatorProfileDTO[]>("/api/creators").then(setRows); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Creators</h1>
      <div className="mt-8">
        {!rows ? <Skeleton className="h-64 rounded-2xl" /> : (
          <DataTable headers={["Creator", "Specialization", "Location", "Rate", "Rating", "Availability"]}>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-ink/6 last:border-0">
                <td className="p-4"><Link href={`/creator/${c.id}`} className="font-medium text-ink hover:underline">{c.user.name}</Link></td>
                <td className="p-4">{c.specialization}</td><td className="p-4 text-muted">{c.location}</td><td className="p-4">${c.hourlyRate}/hr</td>
                <td className="p-4">{c.rating.toFixed(1)} ({c.totalReviews})</td><td className="p-4 text-xs">{c.availability}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
