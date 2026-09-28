import { redirect } from "next/navigation";
import { and, eq, desc } from "drizzle-orm";
import { DollarSign, TrendingUp, Percent } from "lucide-react";
import { db } from "@/lib/db";
import { payments, creatorProfiles } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const session = await getSession();
  if (!session || session.role !== "CREATOR") redirect("/unauthorized");
  const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, session.userId) });
  if (!profile) redirect("/creator/profile");

  const rows = await db.query.payments.findMany({
    where: and(eq(payments.creatorId, profile.id)),
    with: { project: true },
    orderBy: [desc(payments.createdAt)],
  });
  const ok = rows.filter((r) => r.status === "SUCCEEDED");
  const gross = ok.reduce((s, r) => s + r.amount, 0);
  const fees = ok.reduce((s, r) => s + r.platformFee, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Earnings</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Net earnings" value={formatCurrency(gross - fees)} icon={DollarSign} />
        <StatCard label="Gross volume" value={formatCurrency(gross)} icon={TrendingUp} />
        <StatCard label="Platform fees" value={formatCurrency(fees)} icon={Percent} />
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-muted">
            <tr><th className="p-4">Project</th><th className="p-4">Date</th><th className="p-4">Amount</th><th className="p-4">Net</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">No payments yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-ink/6 last:border-0">
                <td className="p-4 font-medium text-ink">{r.project.title}</td>
                <td className="p-4 text-muted">{formatDate(r.createdAt)}</td>
                <td className="p-4">{formatCurrency(r.amount)}</td>
                <td className="p-4">{formatCurrency(r.amount - r.platformFee)}</td>
                <td className="p-4 text-xs font-medium">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
