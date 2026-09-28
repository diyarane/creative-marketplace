import type { ProjectStatus } from "@/lib/db/schema";

export function formatStatus(status: ProjectStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  DRAFT: "bg-neutral-200 text-neutral-700",
  OPEN: "bg-sky-100 text-sky-700",
  PROPOSALS_RECEIVED: "bg-sky-100 text-sky-700",
  FREELANCER_SELECTED: "bg-violet-100 text-violet-700",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  SUBMITTED: "bg-indigo-100 text-indigo-700",
  REVISION_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PAYMENT_PENDING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};
