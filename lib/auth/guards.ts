import "server-only";
import { getSession, SessionPayload } from "./session";
import type { Role } from "@/lib/db/schema";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Throws if there is no logged-in user. Use inside API route handlers. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError("You must be signed in to do this.", 401);
  return session;
}

/** Throws if the logged-in user does not have one of the allowed roles. */
export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await requireUser();
  if (!roles.includes(session.role)) {
    throw new AuthError("You do not have permission to access this resource.", 403);
  }
  return session;
}
