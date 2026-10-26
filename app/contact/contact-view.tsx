"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  HelpCircle,
  Briefcase,
  ShieldAlert,
  Handshake,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Send,
  RotateCcw,
} from "lucide-react";
import {
  contactSchema,
  CONTACT_CATEGORIES,
  type ContactInput,
  type ContactCategoryValue,
} from "@/lib/validations/contact";
import { apiFetch, ApiError } from "@/lib/fetcher";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SubmissionSuccess {
  referenceId: string;
  category: string;
  receivedAt: string;
  message: string;
}

const CATEGORY_CARDS = [
  {
    value: "general",
    title: "General Enquiries",
    desc: "Platform overview, account access, or navigation questions.",
    icon: HelpCircle,
  },
  {
    value: "client_support",
    title: "Client Support",
    desc: "Brief posting, proposal evaluations, and project milestones.",
    icon: MessageSquare,
  },
  {
    value: "creator_support",
    title: "Creator Support",
    desc: "Portfolio display, services configuration, and payout workflows.",
    icon: Mail,
  },
  {
    value: "partnerships",
    title: "Partnerships",
    desc: "Studio collaborations, institutional outreach, and press.",
    icon: Handshake,
  },
  {
    value: "careers",
    title: "Careers & Talent",
    desc: "Introductions and future product, engineering, or design roles.",
    icon: Briefcase,
  },
  {
    value: "trust_safety",
    title: "Trust & Safety",
    desc: "Escalations, suspicious profiles, or conduct reports.",
    icon: ShieldAlert,
  },
];

export function ContactView() {
  return (
    <React.Suspense fallback={<ContactFallback />}>
      <ContactFormInner />
    </React.Suspense>
  );
}

function ContactFallback() {
  return (
    <div className="min-h-[70vh] bg-ink px-4 py-24 text-paper flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl text-paper">Loading contact options...</p>
      </div>
    </div>
  );
}

function ContactFormInner() {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  // Resolve initial category from query param if valid
  const rawParam = searchParams.get("category");
  const validCategory = CONTACT_CATEGORIES.some((c) => c.value === rawParam)
    ? (rawParam as ContactCategoryValue)
    : "general";

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successResult, setSuccessResult] = React.useState<SubmissionSuccess | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: validCategory,
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const selectedCategory = watch("category");

  // Keep category in sync if URL query parameter changes
  React.useEffect(() => {
    if (rawParam && CONTACT_CATEGORIES.some((c) => c.value === rawParam)) {
      setValue("category", rawParam as ContactCategoryValue);
    }
  }, [rawParam, setValue]);

  async function onSubmit(data: ContactInput) {
    setServerError(null);
    try {
      const res = await apiFetch<SubmissionSuccess>("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccessResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to send your message. Please check your connection and try again.");
      }
    }
  }

  function handleReset() {
    setSuccessResult(null);
    setServerError(null);
    reset({
      category: "general",
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  }

  const fadeIn = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="bg-ink text-paper">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-paper/10 pt-20 pb-20 sm:pt-28 sm:pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(55% 45% at 60% 25%, rgba(54,84,255,0.26), transparent 70%), radial-gradient(40% 40% at 20% 70%, rgba(242,84,45,0.16), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wider text-paper/80 uppercase">
              <Mail className="size-3.5 text-signal" />
              Contact the Team
            </div>

            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-paper">
              We are here to help you{" "}
              <span className="text-[#8ea2ff]">collaborate with confidence.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-paper/70">
              Have an inquiry regarding project scoping, creator services, partnership opportunities, or trust &amp; safety? Submit your message below to connect directly with the Reelcraft administrative team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content: Categories Info & Contact Form */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Context, Categories, and Expectations */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div {...fadeIn(0)}>
              <h2 className="font-display text-2xl font-semibold text-paper">
                How can we support you?
              </h2>
              <p className="mt-2 text-sm text-paper/70">
                Select the category that best matches your request so our team can provide timely, relevant assistance.
              </p>
            </motion.div>

            {/* Category Quick Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {CATEGORY_CARDS.map((cat, i) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    onClick={() => setValue("category", cat.value as ContactCategoryValue)}
                    {...fadeIn(i * 0.04)}
                    className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-signal bg-signal/10 ring-1 ring-signal/30"
                        : "border-paper/10 bg-white/[0.025] hover:border-paper/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-signal text-white"
                          : "bg-white/[0.05] text-[#8ea2ff]"
                      }`}
                    >
                      <cat.icon className="size-4" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-paper" : "text-paper/90"
                        }`}
                      >
                        {cat.title}
                      </p>
                      <p className="mt-0.5 text-xs text-paper/60 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Direct Intake Operational Notice */}
            <motion.div
              {...fadeIn(0.2)}
              className="rounded-2xl border border-paper/10 bg-white/[0.02] p-6 text-xs text-paper/70 leading-relaxed"
            >
              <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#8ea2ff]">
                <Clock className="size-3.5 text-signal" />
                Intake &amp; Review Expectations
              </div>
              <p className="mt-2.5">
                All submissions through this form are logged directly to the Reelcraft administrative dashboard and internal notifications queue. To ensure security and prevent missed requests, we do not operate unmonitored external email mailboxes or phone lines.
              </p>
              <p className="mt-2 text-paper/50">
                Responses are handled during active production hours by human team members.
              </p>
            </motion.div>
          </div>

          {/* Right Column: Contact Form / Success State */}
          <div className="lg:col-span-7">
            <motion.div
              {...fadeIn(0.1)}
              className="rounded-2xl border border-paper/10 bg-white/[0.025] p-6 sm:p-10"
            >
              {successResult ? (
                /* Success State */
                <div className="text-center py-6 sm:py-10">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/20 text-success">
                    <CheckCircle2 className="size-7" />
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-semibold text-paper sm:text-3xl">
                    Message Received
                  </h3>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/15 bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-[#8ea2ff]">
                    <span>Reference:</span>
                    <strong className="text-paper">{successResult.referenceId}</strong>
                  </div>

                  <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper/80">
                    {successResult.message} Your request has been securely recorded under category{" "}
                    <span className="font-semibold text-paper capitalize">
                      {successResult.category.replace("_", " ")}
                    </span>
                    .
                  </p>

                  <div className="mx-auto mt-6 max-w-lg rounded-xl border border-paper/10 bg-white/[0.02] p-4 text-xs text-paper/60 text-left">
                    <p className="font-semibold text-paper/80">System Notice</p>
                    <p className="mt-1">
                      Your message was processed and recorded directly in the Reelcraft database for administrative review. Outbound email relays are not configured in this demonstration environment, so confirmation emails are logged to the platform console.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button onClick={handleReset} variant="outline" size="md" className="border-paper/20 text-paper hover:bg-paper/10">
                      <RotateCcw className="size-4" /> Send Another Message
                    </Button>
                    <Button asChild variant="signal" size="md">
                      <Link href="/explore">
                        Explore Creators <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                /* The Contact Form */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-paper">
                      Send an enquiry
                    </h2>
                    <p className="mt-1 text-xs text-paper/60">
                      Fields marked with an asterisk (<span className="text-flare">*</span>) are required.
                    </p>
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300"
                    >
                      <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">Submission failed</p>
                        <p className="mt-0.5">{serverError}</p>
                      </div>
                    </div>
                  )}

                  {/* Category Field */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-semibold text-paper/90">
                      Enquiry Category <span className="text-flare">*</span>
                    </Label>
                    <Select
                      id="category"
                      {...register("category")}
                      aria-invalid={!!errors.category}
                      aria-describedby={errors.category ? "category-error" : undefined}
                      className="border-paper/20 bg-ink-soft text-paper focus-visible:border-signal"
                    >
                      {CONTACT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-ink-soft text-paper">
                          {cat.label}
                        </option>
                      ))}
                    </Select>
                    {errors.category && (
                      <p id="category-error" role="alert" className="text-xs text-flare">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-semibold text-paper/90">
                        Full Name <span className="text-flare">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Elena Vance"
                        autoComplete="name"
                        {...register("name")}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className="border-paper/20 bg-ink-soft text-paper placeholder:text-paper/30 focus-visible:border-signal"
                      />
                      {errors.name && (
                        <p id="name-error" role="alert" className="text-xs text-flare">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold text-paper/90">
                        Email Address <span className="text-flare">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="elena@studio.example"
                        autoComplete="email"
                        {...register("email")}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className="border-paper/20 bg-ink-soft text-paper placeholder:text-paper/30 focus-visible:border-signal"
                      />
                      {errors.email && (
                        <p id="email-error" role="alert" className="text-xs text-flare">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-semibold text-paper/90">
                      Subject <span className="text-flare">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Scoping support for a 3D product launch brief"
                      {...register("subject")}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                      className="border-paper/20 bg-ink-soft text-paper placeholder:text-paper/30 focus-visible:border-signal"
                    />
                    {errors.subject && (
                      <p id="subject-error" role="alert" className="text-xs text-flare">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs font-semibold text-paper/90">
                      Message <span className="text-flare">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Please describe your project, inquiry, or question in detail..."
                      {...register("message")}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className="min-h-32 border-paper/20 bg-ink-soft text-paper placeholder:text-paper/30 focus-visible:border-signal"
                    />
                    {errors.message && (
                      <p id="message-error" role="alert" className="text-xs text-flare">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="signal"
                      size="lg"
                      loading={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      <Send className="size-4" /> Send Message
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
