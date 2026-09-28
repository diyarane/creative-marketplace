"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/fetcher";
import type { SubscriptionPlanDTO, SubscriptionDTO } from "@/types";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate, cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<SubscriptionPlanDTO[] | null>(null);
  const [current, setCurrent] = React.useState<SubscriptionDTO | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setPlans(await apiFetch<SubscriptionPlanDTO[]>("/api/subscriptions/plans"));
    if (user) {
      try {
        setCurrent(await apiFetch<SubscriptionDTO | null>("/api/subscriptions"));
      } catch {
        setCurrent(null);
      }
    }
  }, [user]);
  React.useEffect(() => {
    load();
  }, [load]);

  async function subscribe(planId: string) {
    if (!user) return router.push("/login?next=/subscription");
    setBusy(planId);
    try {
      await apiFetch("/api/subscriptions", { method: "POST", body: JSON.stringify({ planId }) });
      toast({ variant: "success", title: "Subscription activated" });
      await load();
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not subscribe" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Plans for every production</h1>
        <p className="mt-3 text-muted">Pick the plan that fits how often you hire. Upgrade or change any time.</p>
        {current && current.status === "ACTIVE" && (
          <p className="mt-4 inline-block rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success">
            Current plan: {current.plan?.name} · renews {formatDate(current.endDate)}
          </p>
        )}
      </div>
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans === null && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
        {plans?.map((p) => {
          const isCurrent = current?.planId === p.id && current.status === "ACTIVE";
          return (
            <div key={p.id} className={cn("flex flex-col rounded-2xl border p-6", p.highlighted ? "border-signal bg-ink text-paper shadow-xl" : "border-ink/10 bg-white")}>
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-3 text-4xl font-semibold">
                ${p.price}
                <span className={cn("text-sm font-normal", p.highlighted ? "text-paper/60" : "text-muted")}>/mo</span>
              </p>
              <p className={cn("mt-2 text-sm", p.highlighted ? "text-paper/70" : "text-muted")}>{p.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={cn("mt-0.5 size-4 shrink-0", p.highlighted ? "text-signal" : "text-success")} /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={p.highlighted ? "signal" : "outline"}
                disabled={isCurrent}
                loading={busy === p.id}
                onClick={() => subscribe(p.id)}
              >
                {isCurrent ? "Current plan" : p.price === 0 ? "Start free" : "Choose plan"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
