"use client";
import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/fetcher";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/projects/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectDTO } from "@/types";

export default function AdminProjects() {
  const [rows, setRows] = React.useState<ProjectDTO[] | null>(null);
  React.useEffect(() => { apiFetch<ProjectDTO[]>("/api/admin/projects").then(setRows); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Projects</h1>
      <div className="mt-8">
        {!rows ? <Skeleton className="h-64 rounded-2xl" /> : (
          <DataTable headers={["Project", "Client", "Creator", "Budget", "Deadline", "Status"]}>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-ink/6 last:border-0">
                <td className="p-4"><Link href={`/projects/${p.id}`} className="font-medium text-ink hover:underline">{p.title}</Link></td>
                <td className="p-4 text-muted">{p.client?.name}</td><td className="p-4 text-muted">{p.creator?.user.name ?? "—"}</td>
                <td className="p-4">{p.agreedPrice ? formatCurrency(p.agreedPrice) : `${formatCurrency(p.budgetMin)}–${formatCurrency(p.budgetMax)}`}</td>
                <td className="p-4 text-muted">{formatDate(p.deadline)}</td><td className="p-4"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
