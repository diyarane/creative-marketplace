"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProposalSchema } from "@/lib/validations/project";
import type { z } from "zod";
import { useProject } from "@/hooks/use-project";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

type FormValues = z.input<typeof createProposalSchema>;

export default function SubmitProposalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { project, loading } = useProject(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: { revisionsIncluded: 2, deliveryDays: 7 },
  });

  async function onSubmit(data: FormValues) {
    try {
      await apiFetch(`/api/projects/${id}/proposals`, { method: "POST", body: JSON.stringify(data) });
      toast({ variant: "success", title: "Proposal submitted", description: "The client has been notified." });
      router.push("/projects/opportunities");
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not submit proposal" });
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-6 h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg font-medium text-ink">Project could not be loaded</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Submit a proposal</h1>
      <p className="mt-1 text-sm text-muted">
        For <span className="font-medium text-ink">{project.title}</span> · Budget {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-2xl border border-ink/10 bg-white p-6" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Your price (USD)</Label>
            <Input id="price" type="number" min={1} placeholder="1800" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="deliveryDays">Delivery time (days)</Label>
            <Input id="deliveryDays" type="number" min={1} {...register("deliveryDays")} />
            {errors.deliveryDays && <p className="mt-1 text-xs text-red-600">{errors.deliveryDays.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="revisionsIncluded">Revisions included</Label>
          <Input id="revisionsIncluded" type="number" min={0} max={20} {...register("revisionsIncluded")} />
          {errors.revisionsIncluded && <p className="mt-1 text-xs text-red-600">{errors.revisionsIncluded.message}</p>}
        </div>
        <div>
          <Label htmlFor="message">Message to client</Label>
          <Textarea id="message" rows={6} placeholder="Explain your approach, relevant experience, and why you're a great fit..." {...register("message")} />
          {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Submit proposal
        </Button>
      </form>
    </div>
  );
}
