"use client";
import * as React from "react";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { PublicUser } from "@/types";

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<PublicUser[] | null>(null);
  const load = React.useCallback(() => { apiFetch<PublicUser[]>("/api/admin/users").then(setUsers); }, []);
  React.useEffect(load, [load]);
  async function toggle(u: PublicUser) {
    try { await apiFetch(`/api/admin/users/${u.id}/deactivate`, { method: "POST" }); toast({ variant: "success", title: u.active ? "User deactivated" : "User reactivated" }); load(); }
    catch (e) { toast({ variant: "error", title: e instanceof ApiError ? e.message : "Failed" }); }
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Users</h1>
      <div className="mt-8">
        {!users ? <Skeleton className="h-64 rounded-2xl" /> : (
          <DataTable headers={["Name", "Email", "Role", "Joined", "Status", ""]}>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/6 last:border-0">
                <td className="p-4 font-medium text-ink">{u.name}</td><td className="p-4 text-muted">{u.email}</td>
                <td className="p-4"><Badge variant="outline">{u.role}</Badge></td><td className="p-4 text-muted">{formatDate(u.createdAt)}</td>
                <td className="p-4"><Badge variant={u.active ? "success" : "danger"}>{u.active ? "Active" : "Deactivated"}</Badge></td>
                <td className="p-4 text-right">{u.role !== "ADMIN" && <Button size="sm" variant="outline" onClick={() => toggle(u)}>{u.active ? "Deactivate" : "Reactivate"}</Button>}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
