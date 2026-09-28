"use client";
import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/fetcher";
import { NotificationDTO } from "@/types";
import { timeAgo, cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const [notifications, setNotifications] = React.useState<NotificationDTO[]>([]);
  const [open, setOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await apiFetch<NotificationDTO[]>("/api/notifications");
      setNotifications(data);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await apiFetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative rounded-full p-2 hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30" aria-label="Notifications">
        <Bell className="size-5 text-ink/80" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-flare text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-signal hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
          )}
          {notifications.slice(0, 8).map((n) => (
            <Link
              key={n.id}
              href={n.link || "/notifications"}
              onClick={() => {
                if (!n.read) markRead(n.id);
                setOpen(false);
              }}
              className={cn("block border-b border-ink/6 px-4 py-3 last:border-0 hover:bg-ink/3", !n.read && "bg-signal/5")}
            >
              <div className="flex items-start gap-2">
                {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" />}
                <div className={cn(n.read && "pl-3.5")}>
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/notifications" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-xs font-medium text-signal hover:underline">
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
