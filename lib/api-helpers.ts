import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/guards";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handleRoute<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(err.issues[0]?.message || "Invalid input", 422);
    }
    if (err instanceof AuthError || err instanceof AppError) {
      return jsonError(err.message, err.status);
    }
    console.error(err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
