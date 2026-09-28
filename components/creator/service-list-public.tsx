import { Clock, RefreshCw } from "lucide-react";
import type { ServiceDTO } from "@/types";

export function ServiceList({ services }: { services: ServiceDTO[] }) {
  if (services.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 py-12 text-center">
        <p className="text-sm text-muted">No services listed yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {services.map((s) => (
        <div key={s.id} className="rounded-2xl border border-ink/10 p-5 transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-ink">{s.title}</p>
          <p className="mt-1.5 line-clamp-3 text-sm text-muted">{s.description}</p>
          <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> {s.deliveryDays}d
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="size-3.5" /> {s.revisionsIncluded} rev.
              </span>
            </div>
            <span className="text-lg font-semibold text-ink">${s.price.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
