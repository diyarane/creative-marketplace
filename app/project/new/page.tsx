"use client";
import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, FileText, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProjectDTO } from "@/types";

const STEPS = ["Basics", "Requirements", "Budget & Deadline", "Reference Files", "Review"];

interface FormState {
  title: string;
  category: string;
  description: string;
  requirements: string;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  files: { name: string; size: number }[];
}

const EMPTY: FormState = {
  title: "",
  category: "",
  description: "",
  requirements: "",
  budgetMin: "",
  budgetMax: "",
  deadline: "",
  files: [],
};

function Wizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const creatorId = params.get("creatorId");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep(): boolean {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (form.title.trim().length < 5) next.title = "Title must be at least 5 characters";
      if (!form.category) next.category = "Select a category";
    }
    if (step === 1) {
      if (form.description.trim().length < 30) next.description = "Description must be at least 30 characters";
      if (form.requirements.trim().length < 10) next.requirements = "Add at least a few requirements";
    }
    if (step === 2) {
      const min = Number(form.budgetMin);
      const max = Number(form.budgetMax);
      if (!min || min <= 0) next.budgetMin = "Enter a minimum budget";
      if (!max || max <= 0) next.budgetMax = "Enter a maximum budget";
      if (min && max && max < min) next.budgetMax = "Maximum must be greater than or equal to minimum";
      if (!form.deadline) next.deadline = "Select a deadline";
      else if (new Date(form.deadline).getTime() <= Date.now()) next.deadline = "Deadline must be in the future";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function addMockFile() {
    const names = ["reference-moodboard.pdf", "brand-guidelines.png", "example-footage.mp4", "inspiration-deck.pdf"];
    const name = names[form.files.length % names.length];
    update("files", [...form.files, { name, size: Math.floor(Math.random() * 4_000_000) + 500_000 }]);
  }

  function removeFile(idx: number) {
    update("files", form.files.filter((_, i) => i !== idx));
  }

  async function publish(publishNow: boolean) {
    setSubmitting(true);
    try {
      const project = await apiFetch<ProjectDTO>("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          requirements: form.requirements,
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
          deadline: new Date(form.deadline).toISOString(),
          publish: publishNow,
        }),
      });

      for (const file of form.files) {
        await apiFetch(`/api/projects/${project.id}/files`, {
          method: "POST",
          body: JSON.stringify({ fileName: file.name, fileType: file.name.split(".").pop(), fileSize: file.size, kind: "REFERENCE", note: "" }),
        });
      }

      toast({ variant: "success", title: publishNow ? "Project published" : "Draft saved" });
      router.push(publishNow ? `/projects/${project.id}` : "/projects");
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not create project" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Post a new project</h1>
      {creatorId && <p className="mt-1 text-sm text-muted">You&apos;ll be able to invite this creator to submit a proposal once published.</p>}

      <ol className="mt-8 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step ? "bg-signal text-white" : i === step ? "bg-ink text-paper" : "bg-ink/10 text-muted"
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </div>
            <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-ink" : "text-muted")}>{label}</span>
            {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < step ? "bg-signal" : "bg-ink/10")} />}
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="title">Project title</Label>
              <Input id="title" placeholder="e.g. 30-second product launch animation" value={form.title} onChange={(e) => update("title", e.target.value)} />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" value={form.category} onChange={(e) => update("category", e.target.value)}>
                <option value="">Select a category</option>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="description">Project description</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe what you're looking for, the tone, references, and end use of the deliverable..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">{form.description.length}/30 minimum characters</p>
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="requirements">Creative requirements</Label>
              <Textarea
                id="requirements"
                rows={4}
                placeholder="Deliverable formats, dimensions, brand guidelines, must-haves..."
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
              />
              {errors.requirements && <p className="mt-1 text-xs text-red-600">{errors.requirements}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin">Minimum budget (USD)</Label>
                <Input id="budgetMin" type="number" min={1} placeholder="500" value={form.budgetMin} onChange={(e) => update("budgetMin", e.target.value)} />
                {errors.budgetMin && <p className="mt-1 text-xs text-red-600">{errors.budgetMin}</p>}
              </div>
              <div>
                <Label htmlFor="budgetMax">Maximum budget (USD)</Label>
                <Input id="budgetMax" type="number" min={1} placeholder="1500" value={form.budgetMax} onChange={(e) => update("budgetMax", e.target.value)} />
                {errors.budgetMax && <p className="mt-1 text-xs text-red-600">{errors.budgetMax}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
              {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Attach any references, mood boards, or brand assets. This is optional but helps creators submit stronger proposals.</p>
            <button
              type="button"
              onClick={addMockFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 py-8 text-sm font-medium text-muted hover:border-signal hover:text-signal"
            >
              <Upload className="size-4" /> Click to attach a reference file
            </button>
            {form.files.length > 0 && (
              <ul className="space-y-2">
                {form.files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border border-ink/10 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-ink">
                      <FileText className="size-4 text-muted" /> {f.name}
                      <span className="text-xs text-muted">({(f.size / 1_000_000).toFixed(1)} MB)</span>
                    </span>
                    <button onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>
                      <X className="size-4 text-muted hover:text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Title</p>
              <p className="mt-1 text-sm font-medium text-ink">{form.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Category</p>
              <p className="mt-1 text-sm text-ink">{form.category}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Description</p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{form.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Requirements</p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{form.requirements}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Budget</p>
                <p className="mt-1 text-sm text-ink">
                  {formatCurrency(Number(form.budgetMin))} – {formatCurrency(Number(form.budgetMax))}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Deadline</p>
                <p className="mt-1 text-sm text-ink">{form.deadline}</p>
              </div>
            </div>
            {form.files.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Reference files</p>
                <p className="mt-1 text-sm text-ink">{form.files.length} file(s) attached</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={goBack} disabled={step === 0}>
          <ChevronLeft className="size-4" /> Back
        </Button>
        <div className="flex gap-2">
          {step === STEPS.length - 1 ? (
            <>
              <Button variant="outline" onClick={() => publish(false)} loading={submitting}>
                Save as draft
              </Button>
              <Button onClick={() => publish(true)} loading={submitting}>
                Publish project
              </Button>
            </>
          ) : (
            <Button onClick={goNext}>
              Next <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense>
      <Wizard />
    </Suspense>
  );
}
