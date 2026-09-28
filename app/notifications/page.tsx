"use client";
import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { apiFetch } from "@/lib/fetcher";
import type { NotificationDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo, cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [items, setItems] = React.useState<NotificationDTO[] | null>(null);

  const load = React.useCallback(() => {
    apiFetch<NotificationDTO[]>("/api/notifications").then(setItems).catch(() => setItems([]));
  }, []);
  React.useEffect(load, [load]);

  async function markAll() {
    await apiFetch("/api/notifications/read-all", { method: "POST" });
    setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
  }
  async function markOne(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
    setItems((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? prev);
  }

  const unread = items?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-muted">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll}>
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        )}
      </div>
      <div className="mt-8 space-y-2">
        {items === null && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        {items?.length === 0 && <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />}
        {items?.map((n) => (
          <div key={n.id} className={cn("flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-4", !n.read && "border-signal/30 bg-signal/5")}>
            <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-signal")} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{n.title}</p>
              <p className="mt-0.5 text-sm text-muted">{n.message}</p>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-muted">{timeAgo(n.createdAt)}</span>
                {n.link && (
                  <Link href={n.link} onClick={() => !n.read && markOne(n.id)} className="font-medium text-signal hover:underline">
                    View
                  </Link>
                )}
                {!n.read && (
                  <button onClick={() => markOne(n.id)} className="text-muted hover:text-ink">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
