import { describe, it, expect } from "vitest";
import { chargePayment, computePlatformFee } from "@/lib/services/payments";

describe("mock payment gateway", () => {
  it("succeeds with a normal card and returns a realistic transaction id", async () => {
    const r = await chargePayment({ amount: 1500, method: "CARD", cardNumber: "4242 4242 4242 4242" });
    expect(r.success).toBe(true);
    expect(r.transactionId).toMatch(/^txn_\d+_[a-z0-9]+$/);
  });
  it("declines cards ending in 0000", async () => {
    const r = await chargePayment({ amount: 1500, method: "CARD", cardNumber: "4000 0000 0000 0000" });
    expect(r.success).toBe(false);
    expect(r.failureReason).toBeTruthy();
  });
  it("rejects non-positive amounts", async () => {
    expect((await chargePayment({ amount: 0, method: "PAYPAL" })).success).toBe(false);
  });
  it("computes platform fees", () => {
    expect(computePlatformFee(2500)).toBe(250);
    expect(computePlatformFee(1000, 0.05)).toBe(50);
  });
});
