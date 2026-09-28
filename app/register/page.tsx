"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { useAuth } from "@/lib/auth/client";
import { useToast } from "@/components/ui/toast";
import type { CurrentUser } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Briefcase, Palette } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const initialRole = searchParams.get("role") === "creator" ? "CREATOR" : "CLIENT";
  const [role, setRole] = React.useState<"CLIENT" | "CREATOR">(initialRole);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { role: initialRole } });

  function selectRole(r: "CLIENT" | "CREATOR") {
    setRole(r);
    setValue("role", r);
  }

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      const user = await apiFetch<CurrentUser>("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
      await refresh();
      toast({ variant: "success", title: `Welcome to Reelcraft, ${user.name.split(" ")[0]}` });
      router.push(user.role === "CREATOR" ? "/creator/profile" : "/dashboard/client");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Join as a client to hire talent, or a creator to find work.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => selectRole("CLIENT")}
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
            role === "CLIENT" ? "border-signal bg-signal/5" : "border-ink/15 hover:bg-ink/3"
          )}
        >
          <Briefcase className={cn("size-5", role === "CLIENT" ? "text-signal" : "text-ink/60")} />
          <span className="text-sm font-semibold">I&apos;m a client</span>
          <span className="text-xs text-muted">I want to hire creative talent</span>
        </button>
        <button
          type="button"
          onClick={() => selectRole("CREATOR")}
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
            role === "CREATOR" ? "border-signal bg-signal/5" : "border-ink/15 hover:bg-ink/3"
          )}
        >
          <Palette className={cn("size-5", role === "CREATOR" ? "text-signal" : "text-ink/60")} />
          <span className="text-sm font-semibold">I&apos;m a creator</span>
          <span className="text-xs text-muted">I want to find creative work</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700" role="alert">
            {serverError}
          </div>
        )}
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jamie Rivera" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...register("password")} />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-signal hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
