"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useProject } from "@/hooks/use-project";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { computePlatformFee } from "@/lib/services/payments";
import Link from "next/link";

type Stage = "summary" | "processing" | "success" | "failed";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { project, loading } = useProject(id);
  const [stage, setStage] = React.useState<Stage>("summary");
  const [method, setMethod] = React.useState<"CARD" | "PAYPAL" | "BANK_TRANSFER">("CARD");
  const [cardNumber, setCardNumber] = React.useState("4242 4242 4242 4242");
  const [failureReason, setFailureReason] = React.useState<string | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium text-ink">Project could not be loaded</p>
      </div>
    );
  }

  const amount = project.agreedPrice || project.budgetMax;
  const fee = computePlatformFee(amount);

  async function confirmPayment() {
    setStage("processing");
    try {
      const result = await apiFetch<{ success: boolean; failureReason?: string }>(`/api/projects/${id}/payment`, {
        method: "POST",
        body: JSON.stringify({ method, cardNumber: method === "CARD" ? cardNumber : undefined }),
      });
      await new Promise((r) => setTimeout(r, 900));
      if (result.success) {
        setStage("success");
      } else {
        setFailureReason(result.failureReason || "Payment failed.");
        setStage("failed");
      }
    } catch (err) {
      setFailureReason(err instanceof ApiError ? err.message : "Payment failed.");
      setStage("failed");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Complete payment</h1>
      <p className="mt-1 text-sm text-muted">{project.title}</p>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6">
        {stage === "summary" && (
          <>
            <div className="space-y-3 border-b border-ink/8 pb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Project amount</span>
                <span className="font-medium text-ink">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Platform fee (10%)</span>
                <span className="font-medium text-ink">{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total charged to you</span>
                <span>{formatCurrency(amount)}</span>
              </div>
              <p className="text-xs text-muted">The platform fee is deducted from the creator&apos;s payout, not added on top of your charge.</p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="method">Payment method</Label>
                <Select id="method" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
                  <option value="CARD">Credit / debit card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                </Select>
              </div>
              {method === "CARD" && (
                <div>
                  <Label htmlFor="card">Card number</Label>
                  <Input id="card" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
                  <p className="mt-1 text-xs text-muted">This is a simulated payment. Any card works — a number ending in 0000 will simulate a decline.</p>
                </div>
              )}
            </div>

            <Button className="mt-6 w-full" size="lg" onClick={confirmPayment}>
              <CreditCard className="size-4" /> Pay {formatCurrency(amount)}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="size-3.5" /> Secured mock transaction — no real charge occurs
            </p>
          </>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center py-12 text-center">
            <Loader2 className="size-10 animate-spin text-signal" />
            <p className="mt-4 font-medium text-ink">Processing payment...</p>
            <p className="mt-1 text-sm text-muted">Please don&apos;t close this window.</p>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="size-14 text-success" />
            <p className="mt-4 text-lg font-semibold text-ink">Payment successful</p>
            <p className="mt-1 text-sm text-muted">The project is now marked complete and the creator has been notified.</p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/projects/${id}`}>View project</Link>
              </Button>
              <Button asChild>
                <Link href={`/projects/${id}/review`}>Leave a review</Link>
              </Button>
            </div>
          </div>
        )}

        {stage === "failed" && (
          <div className="flex flex-col items-center py-8 text-center">
            <XCircle className="size-14 text-red-500" />
            <p className="mt-4 text-lg font-semibold text-ink">Payment failed</p>
            <p className="mt-1 text-sm text-muted">{failureReason}</p>
            <Button className="mt-6" onClick={() => setStage("summary")}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
