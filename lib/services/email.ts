export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

/**
 * Mock email service.
 *
 * In production, replace the body of this function with a call to a real
 * provider (Resend, Postmark, SES, SendGrid...). Every place in the codebase
 * that needs to notify a user by email calls this single function, so
 * swapping providers only requires editing this file.
 */
export async function sendMockEmail(payload: EmailPayload): Promise<{ ok: true; id: string }> {
  const id = `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[mock-email] -> ${payload.to} :: ${payload.subject}`);
  }
  return { ok: true, id };
}
