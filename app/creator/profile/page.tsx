"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { creatorProfileSchema } from "@/lib/validations/profile";
import { useOwnProfile } from "@/hooks/use-creator-profile";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { SPECIALIZATIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

type FormValues = z.input<typeof creatorProfileSchema>;

export default function CreatorProfilePage() {
  const { profile, loading } = useOwnProfile();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(creatorProfileSchema) });

  React.useEffect(() => {
    if (profile) {
      reset({
        headline: profile.headline,
        bio: profile.bio,
        specialization: profile.specialization,
        location: profile.location,
        experience: profile.experience,
        hourlyRate: profile.hourlyRate,
        availability: profile.availability,
      });
    }
  }, [profile, reset]);

  async function onSubmit(data: FormValues) {
    try {
      await apiFetch("/api/creators/profile", { method: "PUT", body: JSON.stringify(data) });
      toast({ variant: "success", title: "Profile saved" });
    } catch (err) {
      toast({ variant: "error", title: err instanceof ApiError ? err.message : "Could not save profile" });
    }
  }

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-10"><Skeleton className="h-96 rounded-2xl" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Your profile</h1>
      <p className="mt-1 text-sm text-muted">This is what clients see when they discover you.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-2xl border border-ink/10 bg-white p-6" noValidate>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" {...register("headline")} />
          {errors.headline && <p className="mt-1 text-xs text-red-600">{errors.headline.message}</p>}
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={6} {...register("bio")} />
          {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="specialization">Specialization</Label>
            <Select id="specialization" {...register("specialization")}>
              {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
          </div>
          <div>
            <Label htmlFor="experience">Years of experience</Label>
            <Input id="experience" type="number" min={0} {...register("experience")} />
          </div>
          <div>
            <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
            <Input id="hourlyRate" type="number" min={1} {...register("hourlyRate")} />
          </div>
        </div>
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select id="availability" {...register("availability")}>
            <option value="AVAILABLE">Available for new projects</option>
            <option value="BUSY">Busy</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </Select>
        </div>
        <Button type="submit" loading={isSubmitting}>Save profile</Button>
      </form>
    </div>
  );
}
