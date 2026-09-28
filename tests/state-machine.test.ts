import { describe, it, expect } from "vitest";
import { assertTransition, ALLOWED_TRANSITIONS } from "@/lib/services/project-state-machine";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/db/schema";

const ok = (a: ProjectStatus, b: ProjectStatus) => expect(() => assertTransition(a, b)).not.toThrow();
const bad = (a: ProjectStatus, b: ProjectStatus) => expect(() => assertTransition(a, b)).toThrow();

describe("project state machine", () => {
  it("allows the happy path", () => {
    const path: ProjectStatus[] = ["DRAFT", "OPEN", "PROPOSALS_RECEIVED", "FREELANCER_SELECTED", "IN_PROGRESS", "SUBMITTED", "APPROVED", "PAYMENT_PENDING", "COMPLETED"];
    for (let i = 0; i < path.length - 1; i++) ok(path[i], path[i + 1]);
  });
  it("allows the revision loop", () => {
    ok("SUBMITTED", "REVISION_REQUESTED");
    ok("REVISION_REQUESTED", "IN_PROGRESS");
    ok("IN_PROGRESS", "SUBMITTED");
    ok("REVISION_REQUESTED", "SUBMITTED");
  });
  it("allows payment retry after failure", () => ok("PAYMENT_PENDING", "APPROVED"));
  it("blocks skipping steps", () => {
    bad("OPEN", "IN_PROGRESS");
    bad("PROPOSALS_RECEIVED", "APPROVED");
    bad("IN_PROGRESS", "COMPLETED");
    bad("SUBMITTED", "PAYMENT_PENDING");
    bad("DRAFT", "COMPLETED");
  });
  it("treats COMPLETED and CANCELLED as terminal", () => {
    for (const s of PROJECT_STATUSES) { bad("COMPLETED", s); bad("CANCELLED", s); }
  });
  it("defines transitions for every status", () => {
    for (const s of PROJECT_STATUSES) expect(ALLOWED_TRANSITIONS[s]).toBeDefined();
  });
  it("throws a 409 AppError", () => {
    try { assertTransition("OPEN", "COMPLETED"); } catch (e) { expect((e as { status: number }).status).toBe(409); }
  });
});
