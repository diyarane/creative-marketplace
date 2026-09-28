"use client";
import * as React from "react";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { useOwnProfile } from "@/hooks/use-creator-profile";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { GRADIENTS, SPECIALIZATIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function PortfolioManagerPage() {
  const { profile, loading, reload } = useOwnProfile();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", description: "", category: SPECIALIZATIONS[0] as string, mediaType: "IMAGE", gradient: "gradient-1" });

  async function add() {
    setBusy(true);
    try {
      await apiFetch("/api/creators/portfolio", { method: "POST", body: JSON.stringify(form) });
      toast({ variant: "success", title: "Portfolio item added" });
      setOpen(false);
      setForm({ ...form, title: "", description: "" });
      reload();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not add item" });
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Remove this portfolio item?")) return;
    try {
      await apiFetch(`/api/creators/portfolio/${id}`, { method: "DELETE" });
      toast({ variant: "success", title: "Item removed" });
      reload();
    } catch {
      toast({ variant: "error", title: "Could not remove item" });
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Portfolio</h1>
          <p className="mt-1 text-sm text-muted">Showcase your best work.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4" /> Add item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add portfolio item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="pt">Title</Label><Input id="pt" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label htmlFor="pd">Description</Label><Textarea id="pd" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="pc">Category</Label><Select id="pc" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}</Select></div>
                <div><Label htmlFor="pm">Type</Label><Select id="pm" value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}><option value="IMAGE">Image</option><option value="VIDEO">Video</option></Select></div>
              </div>
              <div>
                <Label>Cover style</Label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map((g) => (
                    <button key={g} type="button" aria-label={g} onClick={() => setForm({ ...form, gradient: g })} className={cn(g, "size-9 rounded-lg ring-offset-2", form.gradient === g && "ring-2 ring-signal")} />
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={add} loading={busy}>Add to portfolio</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-8">
        {loading && <Skeleton className="h-60 rounded-2xl" />}
        {profile && profile.portfolioItems.length === 0 && <EmptyState icon={ImageIcon} title="No portfolio items" description="Add your first piece of work." />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {profile?.portfolioItems.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-xl border border-ink/10 bg-white">
              <div className={cn(item.gradient, "aspect-[4/3]")} />
              <div className="flex items-center justify-between p-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{item.title}</p><p className="text-xs text-muted">{item.mediaType === "VIDEO" ? "Video" : "Image"}</p></div>
                <button onClick={() => remove(item.id)} aria-label={`Remove ${item.title}`} className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
