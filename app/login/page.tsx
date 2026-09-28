"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { useAuth } from "@/lib/auth/client";
import { useToast } from "@/components/ui/toast";
import type { CurrentUser } from "@/lib/auth/client";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      const user = await apiFetch<CurrentUser>("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
      await refresh();
      toast({ variant: "success", title: `Welcome back, ${user.name.split(" ")[0]}` });
      const next = params.get("next");
      router.push(next || (user.role === "ADMIN" ? "/admin" : user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/client"));
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  function fillDemo(role: "client" | "creator" | "admin") {
    const email = `${role}@example.com`;
    (document.getElementById("email") as HTMLInputElement).value = email;
    (document.getElementById("password") as HTMLInputElement).value = "Password123!";
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Sign in to Reelcraft</h1>
      <p className="mt-2 text-sm text-muted">Access your dashboard, projects, and messages.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["client", "creator", "admin"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => fillDemo(r)}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium capitalize text-ink hover:bg-ink/5"
          >
            Use demo {r}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">
            {serverError}
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-signal hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
