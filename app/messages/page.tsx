"use client";
import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { useAuth } from "@/lib/auth/client";
import type { MessageDTO } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";

interface Conversation {
  user: { id: string; name: string; avatar: string };
  lastMessage: MessageDTO;
  unread: number;
}
interface Thread {
  user: { id: string; name: string; avatar: string };
  messages: MessageDTO[];
}

function MessagesInner() {
  const { user } = useAuth();
  const params = useSearchParams();
  const { toast } = useToast();
  const [convos, setConvos] = React.useState<Conversation[] | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(params.get("with"));
  const [thread, setThread] = React.useState<Thread | null>(null);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const loadConvos = React.useCallback(() => {
    apiFetch<Conversation[]>("/api/messages").then(setConvos).catch(() => setConvos([]));
  }, []);
  const loadThread = React.useCallback((id: string) => {
    apiFetch<Thread>(`/api/messages/${id}`).then(setThread).catch(() => setThread(null));
  }, []);

  React.useEffect(loadConvos, [loadConvos]);
  React.useEffect(() => {
    if (!activeId) return;
    loadThread(activeId);
    const t = setInterval(() => loadThread(activeId), 8000);
    return () => clearInterval(t);
  }, [activeId, loadThread]);
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    setSending(true);
    try {
      await apiFetch("/api/messages", { method: "POST", body: JSON.stringify({ receiverId: activeId, content: text }) });
      setText("");
      loadThread(activeId);
      loadConvos();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not send message" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Messages</h1>
      <div className="mt-6 grid h-[70vh] grid-cols-1 overflow-hidden rounded-2xl border border-ink/10 bg-white md:grid-cols-[300px_1fr]">
        <aside className={cn("overflow-y-auto border-r border-ink/10", activeId && "hidden md:block")}>
          {convos === null && <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>}
          {convos?.length === 0 && <p className="p-6 text-sm text-muted">No conversations yet. Message a creator from their profile.</p>}
          {convos?.map((c) => (
            <button
              key={c.user.id}
              onClick={() => setActiveId(c.user.id)}
              className={cn("flex w-full items-center gap-3 border-b border-ink/6 p-4 text-left hover:bg-ink/3", activeId === c.user.id && "bg-signal/5")}
            >
              <Avatar name={c.user.name} gradient={c.user.avatar} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-ink">{c.user.name}</p>
                  <span className="text-[11px] text-muted">{timeAgo(c.lastMessage.createdAt)}</span>
                </div>
                <p className="truncate text-xs text-muted">{c.lastMessage.content}</p>
              </div>
              {c.unread > 0 && <span className="rounded-full bg-flare px-1.5 text-[10px] font-semibold text-white">{c.unread}</span>}
            </button>
          ))}
        </aside>
        <section className={cn("flex min-h-0 flex-col", !activeId && "hidden md:flex")}>
          {!activeId || !thread ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={MessageCircle} title="Select a conversation" className="border-0" />
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-ink/10 p-4">
                <button className="md:hidden" onClick={() => setActiveId(null)} aria-label="Back">
                  <ArrowLeft className="size-5" />
                </button>
                <Avatar name={thread.user.name} gradient={thread.user.avatar} size="sm" />
                <p className="text-sm font-semibold">{thread.user.name}</p>
              </header>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {thread.messages.length === 0 && <p className="text-center text-sm text-muted">Say hello to start the conversation.</p>}
                {thread.messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm", mine ? "bg-ink text-paper" : "bg-ink/6 text-ink")}>
                        <p>{m.content}</p>
                        <p className={cn("mt-1 text-[10px]", mine ? "text-paper/50" : "text-muted")}>{formatDateTime(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-ink/10 p-3">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." aria-label="Message" />
                <Button type="submit" loading={sending} aria-label="Send">
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesInner />
    </Suspense>
  );
}
