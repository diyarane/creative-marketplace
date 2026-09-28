import type { ProjectStatus } from "@/lib/db/schema";
import { AppError } from "@/lib/api-helpers";
import { formatStatus } from "@/lib/project-status";

export { formatStatus, STATUS_COLORS } from "@/lib/project-status";

/** Defines which statuses a project may legally move to from its current status. */
export const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ["OPEN", "CANCELLED"],
  OPEN: ["PROPOSALS_RECEIVED", "CANCELLED"],
  PROPOSALS_RECEIVED: ["PROPOSALS_RECEIVED", "FREELANCER_SELECTED", "CANCELLED"],
  FREELANCER_SELECTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["REVISION_REQUESTED", "APPROVED", "CANCELLED"],
  REVISION_REQUESTED: ["IN_PROGRESS", "SUBMITTED", "CANCELLED"],
  APPROVED: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["COMPLETED", "APPROVED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertTransition(current: ProjectStatus, next: ProjectStatus) {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new AppError(
      `Project cannot move from ${formatStatus(current)} to ${formatStatus(next)}.`,
      409
    );
  }
}

