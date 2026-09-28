import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import * as s from "@/lib/db/schema";
import { createTestDb, makeUser } from "./helpers";

let ctx: ReturnType<typeof createTestDb>;
beforeEach(() => { ctx = createTestDb(); });

async function setup() {
  const { db } = ctx;
  const client = await makeUser(db, "CLIENT", "client@t.io");
  const cUser = await makeUser(db, "CREATOR", "creator@t.io");
  const cUser2 = await makeUser(db, "CREATOR", "creator2@t.io");
  const mkProfile = async (userId: string) => (await db.insert(s.creatorProfiles).values({ userId, headline: "h", bio: "b", specialization: "Motion Designer", location: "x" }).returning())[0];
  const p1 = await mkProfile(cUser.id), p2 = await mkProfile(cUser2.id);
  const [project] = await db.insert(s.projects).values({ clientId: client.id, title: "T", description: "D", category: "C", budgetMin: 1, budgetMax: 2, deadline: new Date(Date.now() + 1e9), status: "OPEN" }).returning();
  return { db, client, cUser, cUser2, p1, p2, project };
}

describe("database integrity", () => {
  it("enforces unique emails", async () => {
    await makeUser(ctx.db, "CLIENT", "dup@t.io");
    await expect(makeUser(ctx.db, "CLIENT", "dup@t.io")).rejects.toThrow();
  });
  it("prevents duplicate proposals per project/creator", async () => {
    const { db, p1, project } = await setup();
    const v = { projectId: project.id, creatorId: p1.id, price: 10, deliveryDays: 1, message: "m" };
    await db.insert(s.proposals).values(v);
    await expect(db.insert(s.proposals).values(v)).rejects.toThrow();
  });
  it("prevents duplicate reviews per project/reviewer", async () => {
    const { db, client, cUser, project } = await setup();
    const v = { projectId: project.id, reviewerId: client.id, reviewedUserId: cUser.id, rating: 5, comment: "great" };
    await db.insert(s.reviews).values(v);
    await expect(db.insert(s.reviews).values(v)).rejects.toThrow();
  });
  it("rejects orphaned foreign keys", async () => {
    await expect(ctx.db.insert(s.projects).values({ clientId: "missing", title: "T", description: "D", category: "C", budgetMin: 1, budgetMax: 2, deadline: new Date() })).rejects.toThrow();
  });
  it("cascades project deletion to proposals, files and revisions", async () => {
    const { db, client, p1, project } = await setup();
    await db.insert(s.proposals).values({ projectId: project.id, creatorId: p1.id, price: 10, deliveryDays: 1, message: "m" });
    await db.insert(s.revisions).values({ projectId: project.id, requestedBy: client.id, description: "fix" });
    await db.delete(s.projects).where(eq(s.projects.id, project.id));
    expect(await db.select().from(s.proposals)).toHaveLength(0);
    expect(await db.select().from(s.revisions)).toHaveLength(0);
  });
  it("enforces unique payment transaction ids", async () => {
    const { db, client, p1, project } = await setup();
    const v = { projectId: project.id, clientId: client.id, creatorId: p1.id, amount: 10, transactionId: "txn_1" };
    await db.insert(s.payments).values(v);
    await expect(db.insert(s.payments).values(v)).rejects.toThrow();
  });
});

describe("proposal acceptance logic (mirrors /api/proposals/[id]/accept)", () => {
  it("assigns creator, accepts one proposal and rejects the rest", async () => {
    const { db, p1, p2, project } = await setup();
    const [a] = await db.insert(s.proposals).values({ projectId: project.id, creatorId: p1.id, price: 100, deliveryDays: 3, message: "m", revisionsIncluded: 2 }).returning();
    const [b] = await db.insert(s.proposals).values({ projectId: project.id, creatorId: p2.id, price: 200, deliveryDays: 3, message: "m" }).returning();
    await db.update(s.proposals).set({ status: "ACCEPTED" }).where(eq(s.proposals.id, a.id));
    await db.update(s.proposals).set({ status: "REJECTED" }).where(eq(s.proposals.id, b.id));
    await db.update(s.projects).set({ creatorId: a.creatorId, status: "FREELANCER_SELECTED", agreedPrice: a.price }).where(eq(s.projects.id, project.id));
    const updated = await db.query.projects.findFirst({ where: eq(s.projects.id, project.id) });
    expect(updated?.creatorId).toBe(p1.id);
    expect(updated?.status).toBe("FREELANCER_SELECTED");
    const all = await db.select().from(s.proposals);
    expect(all.filter((p) => p.status === "ACCEPTED")).toHaveLength(1);
    expect(all.filter((p) => p.status === "REJECTED")).toHaveLength(1);
  });
});
