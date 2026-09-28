import { db } from "@/lib/db";
import { users, projects, payments, creatorProfiles } from "@/lib/db/schema";
import { handleRoute } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");

    const allUsers = await db.query.users.findMany();
    const allProjects = await db.query.projects.findMany();
    const allPayments = await db.query.payments.findMany({ where: eq(payments.status, "SUCCEEDED") });

    const totalUsers = allUsers.length;
    const totalCreators = allUsers.filter((u) => u.role === "CREATOR").length;
    const totalClients = allUsers.filter((u) => u.role === "CLIENT").length;
    const activeProjects = allProjects.filter((p) =>
      ["OPEN", "PROPOSALS_RECEIVED", "FREELANCER_SELECTED", "IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED"].includes(p.status)
    ).length;
    const completedProjects = allProjects.filter((p) => p.status === "COMPLETED").length;
    const pendingProjects = allProjects.filter((p) => p.status === "DRAFT" || p.status === "OPEN").length;
    const transactionValue = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const statusDistribution: Record<string, number> = {};
    for (const p of allProjects) statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;

    const categoryBreakdown: Record<string, number> = {};
    const creators = await db.query.creatorProfiles.findMany();
    for (const c of creators) categoryBreakdown[c.specialization] = (categoryBreakdown[c.specialization] || 0) + 1;

    // registrations & projects & payments per month for the last 6 months
    const now = new Date();
    const months: { label: string; users: number; projects: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleDateString("en-US", { month: "short" });
      months.push({
        label,
        users: allUsers.filter((u) => new Date(u.createdAt) >= start && new Date(u.createdAt) < end).length,
        projects: allProjects.filter((p) => new Date(p.createdAt) >= start && new Date(p.createdAt) < end).length,
        revenue: allPayments
          .filter((p) => new Date(p.createdAt) >= start && new Date(p.createdAt) < end)
          .reduce((sum, p) => sum + p.amount, 0),
      });
    }

    const recentUsers = [...allUsers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
    const recentPayments = await db.query.payments.findMany({
      orderBy: [desc(payments.createdAt)],
      limit: 6,
      with: { project: true, client: true },
    });

    return {
      totalUsers,
      totalCreators,
      totalClients,
      activeProjects,
      completedProjects,
      pendingProjects,
      transactionValue,
      statusDistribution,
      categoryBreakdown,
      months,
      recentUsers: recentUsers.map((u) => ({ ...u, passwordHash: undefined })),
      recentPayments,
    };
  });
}
