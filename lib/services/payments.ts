export interface ChargeInput {
  amount: number;
  method: "CARD" | "PAYPAL" | "BANK_TRANSFER";
  cardNumber?: string;
}

export interface ChargeResult {
  success: boolean;
  transactionId: string;
  failureReason?: string;
}

/**
 * Mock payment gateway.
 *
 * This mirrors the shape of a real gateway call (e.g. `stripe.paymentIntents.create`)
 * so that swapping in Stripe later only requires rewriting the inside of this
 * function and keeping the same `ChargeInput` / `ChargeResult` contract.
 *
 * Simulated rule: a card ending in 0000 always fails, so the "failed payment"
 * state is reachable and testable from the UI without any special flags.
 */
export async function chargePayment(input: ChargeInput): Promise<ChargeResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  if (input.cardNumber && input.cardNumber.replace(/\s/g, "").endsWith("0000")) {
    return {
      success: false,
      transactionId,
      failureReason: "The card was declined by the issuing bank.",
    };
  }

  if (input.amount <= 0) {
    return { success: false, transactionId, failureReason: "Invalid payment amount." };
  }

  return { success: true, transactionId };
}

export const PLATFORM_FEE_RATE = 0.1;

export function computePlatformFee(amount: number, rate: number = PLATFORM_FEE_RATE) {
  return Math.round(amount * rate * 100) / 100;
}
