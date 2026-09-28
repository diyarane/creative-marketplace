import { db } from "@/lib/db";
import { projects, payments } from "@/lib/db/schema";
import { handleRoute, AppError } from "@/lib/api-helpers";
import { requireRole } from "@/lib/auth/guards";
import { assertTransition } from "@/lib/services/project-state-machine";
import { createNotification } from "@/lib/services/notifications";
import { chargePayment, computePlatformFee } from "@/lib/services/payments";
import { getSettings } from "@/lib/services/settings";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  method: z.enum(["CARD", "PAYPAL", "BANK_TRANSFER"]),
  cardNumber: z.string().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const { id } = await params;
    const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId) throw new AppError("You do not own this project.", 403);
    const existing = await db.query.payments.findFirst({ where: eq(payments.projectId, id) });
    return existing || null;
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const session = await requireRole("CLIENT");
    const { id } = await params;
    const body = schema.parse(await req.json());

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: { creator: { with: { user: true } } },
    });
    if (!project) throw new AppError("Project not found.", 404);
    if (project.clientId !== session.userId) throw new AppError("You do not own this project.", 403);
    if (!project.creator) throw new AppError("This project has no assigned creator yet.", 409);

    assertTransition(project.status, "PAYMENT_PENDING");
    await db.update(projects).set({ status: "PAYMENT_PENDING", updatedAt: new Date() }).where(eq(projects.id, id));

    const amount = project.agreedPrice || project.budgetMax;
    const result = await chargePayment({ amount, method: body.method, cardNumber: body.cardNumber });

    const [payment] = await db
      .insert(payments)
      .values({
        projectId: id,
        clientId: session.userId,
        creatorId: project.creator.id,
        amount,
        platformFee: computePlatformFee(amount, Number((await getSettings()).platformFeeRate)),
        status: result.success ? "SUCCEEDED" : "FAILED",
        method: body.method,
        transactionId: result.transactionId,
      })
      .returning();

    if (result.success) {
      assertTransition("PAYMENT_PENDING", "COMPLETED");
      await db.update(projects).set({ status: "COMPLETED", updatedAt: new Date() }).where(eq(projects.id, id));

      await createNotification({
        userId: project.creator.userId,
        type: "PAYMENT_COMPLETED",
        title: "Payment completed",
        message: `You were paid $${amount.toLocaleString()} for "${project.title}".`,
        link: `/earnings`,
        emailTo: project.creator.user.email,
      });
    } else {
      // roll back to APPROVED so the client can retry payment
      await db.update(projects).set({ status: "APPROVED", updatedAt: new Date() }).where(eq(projects.id, id));
    }

    return { payment, success: result.success, failureReason: result.failureReason };
  });
}
