import { Badge } from "@/components/ui/badge";
import { formatStatus, STATUS_COLORS } from "@/lib/project-status";
import type { ProjectStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", STATUS_COLORS[status], className)}>{formatStatus(status)}</span>;
}
