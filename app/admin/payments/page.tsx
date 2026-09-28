"use client";
import * as React from "react";
import { apiFetch } from "@/lib/fetcher";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PaymentDTO } from "@/types";

type Row = PaymentDTO & { client: { name: string }; creator: { user: { name: string } } };

export default function AdminPayments() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  React.useEffect(() => { apiFetch<Row[]>("/api/admin/payments").then(setRows); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Payments</h1>
      <div className="mt-8">
        {!rows ? <Skeleton className="h-64 rounded-2xl" /> : (
          <DataTable headers={["Transaction", "Project", "Client", "Creator", "Amount", "Fee", "Method", "Date", "Status"]} empty={rows.length === 0}>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-ink/6 last:border-0">
                <td className="p-4 font-mono text-xs">{p.transactionId}</td><td className="p-4">{p.project?.title}</td><td className="p-4 text-muted">{p.client.name}</td><td className="p-4 text-muted">{p.creator.user.name}</td>
                <td className="p-4">{formatCurrency(p.amount)}</td><td className="p-4 text-muted">{formatCurrency(p.platformFee)}</td><td className="p-4 text-xs">{p.method}</td><td className="p-4 text-muted">{formatDateTime(p.createdAt)}</td>
                <td className="p-4"><Badge variant={p.status === "SUCCEEDED" ? "success" : p.status === "FAILED" ? "danger" : "neutral"}>{p.status}</Badge></td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
