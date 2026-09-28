"use client";
import * as React from "react";
import { Plus, Trash2, Pencil, Package } from "lucide-react";
import { useOwnProfile } from "@/hooks/use-creator-profile";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { SPECIALIZATIONS } from "@/lib/constants";
import type { ServiceDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BLANK = { title: "", description: "", category: SPECIALIZATIONS[0] as string, price: "", deliveryDays: "7", revisionsIncluded: "2" };

export default function ServicesManagerPage() {
  const { profile, loading, reload } = useOwnProfile();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ServiceDTO | null>(null);
  const [form, setForm] = React.useState(BLANK);
  const [busy, setBusy] = React.useState(false);

  function openNew() { setEditing(null); setForm(BLANK); setOpen(true); }
  function openEdit(s: ServiceDTO) {
    setEditing(s);
    setForm({ title: s.title, description: s.description, category: s.category, price: String(s.price), deliveryDays: String(s.deliveryDays), revisionsIncluded: String(s.revisionsIncluded) });
    setOpen(true);
  }
  async function save() {
    setBusy(true);
    try {
      await apiFetch(editing ? `/api/services/${editing.id}` : "/api/services", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
      toast({ variant: "success", title: editing ? "Service updated" : "Service created" });
      setOpen(false);
      reload();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not save service" });
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Deactivate this service?")) return;
    await apiFetch(`/api/services/${id}`, { method: "DELETE" });
    toast({ variant: "success", title: "Service removed" });
    reload();
  }

  const active = profile?.services.filter((s) => s.active) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Services</h1>
          <p className="mt-1 text-sm text-muted">Fixed-scope offerings clients can hire you for.</p>
        </div>
        <Button onClick={openNew}><Plus className="size-4" /> New service</Button>
      </div>
      <div className="mt-8 space-y-3">
        {loading && <Skeleton className="h-32 rounded-2xl" />}
        {profile && active.length === 0 && <EmptyState icon={Package} title="No services yet" description="Create a service to appear in search results." />}
        {active.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-5">
            <div>
              <p className="font-semibold text-ink">{s.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{s.description}</p>
              <p className="mt-2 text-xs text-muted">{s.category} · {s.deliveryDays} days · {s.revisionsIncluded} revisions</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="mr-2 text-lg font-semibold">${s.price.toLocaleString()}</span>
              <button onClick={() => openEdit(s)} aria-label="Edit" className="rounded-full p-2 hover:bg-ink/5"><Pencil className="size-4" /></button>
              <button onClick={() => remove(s.id)} aria-label="Delete" className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="st">Title</Label><Input id="st" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label htmlFor="sd">Description</Label><Textarea id="sd" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label htmlFor="sc">Category</Label><Select id="sc" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}</Select></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label htmlFor="sp">Price ($)</Label><Input id="sp" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label htmlFor="sdd">Days</Label><Input id="sdd" type="number" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} /></div>
              <div><Label htmlFor="sr">Revisions</Label><Input id="sr" type="number" value={form.revisionsIncluded} onChange={(e) => setForm({ ...form, revisionsIncluded: e.target.value })} /></div>
            </div>
            <Button className="w-full" onClick={save} loading={busy}>{editing ? "Save changes" : "Create service"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
