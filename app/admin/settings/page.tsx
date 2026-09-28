"use client";
import * as React from "react";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [fee, setFee] = React.useState<string | null>(null);
  const [allow, setAllow] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    apiFetch<{ platformFeeRate: string; allowRegistrations: string }>("/api/admin/settings").then((s) => { setFee(String(Number(s.platformFeeRate) * 100)); setAllow(s.allowRegistrations === "true"); });
  }, []);
  async function save() {
    setBusy(true);
    try { await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify({ platformFeeRate: Number(fee) / 100, allowRegistrations: allow }) }); toast({ variant: "success", title: "Settings saved" }); }
    catch (e) { toast({ variant: "error", title: e instanceof ApiError ? e.message : "Could not save" }); }
    finally { setBusy(false); }
  }
  if (fee === null) return <div className="mx-auto max-w-xl px-4 py-10"><Skeleton className="h-64 rounded-2xl" /></div>;
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
      <div className="mt-8 space-y-6 rounded-2xl border border-ink/10 bg-white p-6">
        <div><Label htmlFor="fee">Platform fee (%)</Label><Input id="fee" type="number" min={0} max={50} value={fee} onChange={(e) => setFee(e.target.value)} /><p className="mt-1 text-xs text-muted">Applied to new payments only.</p></div>
        <label className="flex items-center gap-3 text-sm"><Checkbox checked={allow} onCheckedChange={(v) => setAllow(v === true)} /> Allow new registrations</label>
        <Button onClick={save} loading={busy}>Save settings</Button>
      </div>
    </div>
  );
}
