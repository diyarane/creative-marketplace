import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { createProjectSchema, createProposalSchema, reviewSchema, revisionRequestSchema } from "@/lib/validations/project";

const future = new Date(Date.now() + 7 * 864e5).toISOString();
const validProject = { title: "Launch film", category: "Motion Graphics", description: "A description that is comfortably longer than thirty characters.", requirements: "16:9 export", budgetMin: 500, budgetMax: 900, deadline: future };

describe("registration validation", () => {
  it("accepts a valid registration and normalizes email", () => {
    const r = registerSchema.parse({ name: "Ada Lovelace", email: "  ADA@Example.com ", password: "Password123!", role: "CLIENT" });
    expect(r.email).toBe("ada@example.com");
  });
  it("rejects weak passwords", () => {
    expect(registerSchema.safeParse({ name: "Ada", email: "a@b.co", password: "short", role: "CLIENT" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Ada", email: "a@b.co", password: "nouppercase1", role: "CLIENT" }).success).toBe(false);
  });
  it("never allows self-registration as ADMIN", () => {
    expect(registerSchema.safeParse({ name: "Ada", email: "a@b.co", password: "Password123!", role: "ADMIN" }).success).toBe(false);
  });
  it("login requires a valid email and password", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});

describe("project creation validation", () => {
  it("accepts a valid project", () => expect(createProjectSchema.safeParse(validProject).success).toBe(true));
  it("rejects max budget below min", () => expect(createProjectSchema.safeParse({ ...validProject, budgetMin: 900, budgetMax: 100 }).success).toBe(false));
  it("rejects past deadlines", () => expect(createProjectSchema.safeParse({ ...validProject, deadline: "2001-01-01" }).success).toBe(false));
  it("rejects short titles/descriptions", () => expect(createProjectSchema.safeParse({ ...validProject, title: "x", description: "short" }).success).toBe(false));
});

describe("proposal / revision / review validation", () => {
  it("validates proposals", () => {
    expect(createProposalSchema.safeParse({ price: 100, deliveryDays: 5, message: "A sufficiently long proposal message.", revisionsIncluded: 2 }).success).toBe(true);
    expect(createProposalSchema.safeParse({ price: -1, deliveryDays: 0, message: "short", revisionsIncluded: 2 }).success).toBe(false);
  });
  it("requires revision descriptions", () => expect(revisionRequestSchema.safeParse({ description: "no" }).success).toBe(false));
  it("limits ratings to 1-5", () => {
    expect(reviewSchema.safeParse({ rating: 6, comment: "Great collaboration overall." }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 0, comment: "Great collaboration overall." }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 5, comment: "Great collaboration overall." }).success).toBe(true);
  });
});
