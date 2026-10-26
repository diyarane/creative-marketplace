"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  UserCheck,
  FileText,
  MessageSquare,
  AlertTriangle,
  Scale,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    id: "account-authenticity",
    title: "Account Authenticity & Accurate Profiles",
    icon: UserCheck,
    content: [
      "Authenticity is the foundation of every successful creative partnership. On Reelcraft, every creator profile is linked to an authenticated account and showcases specialized disciplines, experience levels, and original work samples.",
      "We expect creators to upload only portfolio items they contributed to directly or created independently, crediting specific roles (e.g. 3D modeling vs. animation) accurately in project descriptions.",
      "Clients benefit from transparent profile data, including average review ratings and verified reviews tied strictly to completed projects.",
    ],
    tips: [
      "Review creator portfolios and service details before submitting project invitations.",
      "Creators should keep availability status and hourly expectations up to date.",
      "Misrepresentation of portfolio ownership or skills is grounds for account deactivation.",
    ],
  },
  {
    id: "project-scoping",
    title: "Clear Scopes, Deliverables & Revisions",
    icon: FileText,
    content: [
      "Ambiguity is the single largest cause of friction in creative production. Visual media projects involve render times, file encoding, asset preparation, and specific technical milestones.",
      "Reelcraft's project system encourages structured agreements: specifying category, requirements, budget parameters, delivery dates, and explicitly agreed revision allowances before work moves to In Progress.",
      "Proposals submitted by creators explicitly state their proposed delivery days, fee, and number of included revision rounds, ensuring mutual alignment from the start.",
    ],
    tips: [
      "Define video resolutions, aspect ratios, frame rates, and source file requirements early.",
      "Agree on what constitutes a standard revision (e.g. timing tweak) versus a major scope change.",
      "Keep all formal revision requests logged in the project workspace revision tracker.",
    ],
  },
  {
    id: "documented-collaboration",
    title: "Safe Collaboration & Documented Workflows",
    icon: FileCheck,
    content: [
      "Keeping your communication, files, and milestones within Reelcraft protects both parties. When discussions and deliveries take place inside the platform, there is an objective, time-stamped record of what was requested and delivered.",
      "Reelcraft provides a dedicated workspace for active projects, allowing clients and creators to share reference files, deliver submissions, submit revision feedback, and track project status changes.",
      "Moving communication to unrecorded external channels makes it difficult to verify timelines, approvals, or deliverable obligations if a misunderstanding arises.",
    ],
    tips: [
      "Upload submission files and project references directly within the project files tab.",
      "Confirm deliverable approvals and status transitions through the platform interface.",
      "Avoid relying on verbal or external promises that are not recorded in project messages.",
    ],
  },
  {
    id: "responsible-messaging",
    title: "Responsible Messaging & Confidentiality",
    icon: MessageSquare,
    content: [
      "Reelcraft direct messaging enables efficient collaboration between collaborators. It is intended strictly for project discussions, creative feedback, and professional coordination.",
      "Respect proprietary assets, unreleased marketing concepts, and private client materials shared during production. Treat all shared work as confidential unless public portfolio rights are agreed upon.",
      "Unsolicited promotional outreach, harassment, deceptive links, and unprofessional conduct are strictly prohibited.",
    ],
    tips: [
      "Keep conversations focused on project requirements, progress, and feedback.",
      "Obtain client permission before sharing work-in-progress stills or finished commercial spots.",
      "Do not share payment credentials, sensitive passwords, or personal financial details.",
    ],
  },
  {
    id: "reporting-concerns",
    title: "Reporting Concerns & Dispute Support",
    icon: AlertTriangle,
    content: [
      "We understand that despite best intentions, production challenges or communication breakdowns can occur. Reelcraft does not use opaque automated algorithms to judge creative disputes; our administrative team investigates reported issues directly.",
      "If you encounter a suspicious user, copyright infringement, non-responsive counterparty during an active milestone, or abusive behavior, we encourage you to notify our team immediately.",
      "Our team reviews the documented project brief, workspace history, and direct messages to understand the situation and provide mediation guidance or take platform action.",
    ],
    tips: [
      "Document the specific issue and point to relevant project files or message exchanges.",
      "Attempt a respectful, clear clarification with the other party first whenever safe to do so.",
      "Submit a Trust & Safety report using our contact form for dedicated team review.",
    ],
  },
];

export function TrustSafetyView() {
  const reduce = useReducedMotion();

  const fadeIn = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="bg-ink text-paper">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-paper/10 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(55% 45% at 75% 25%, rgba(54,84,255,0.26), transparent 70%), radial-gradient(40% 40% at 20% 70%, rgba(28,138,91,0.18), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wider text-paper/80 uppercase">
              <ShieldCheck className="size-3.5 text-signal" />
              Trust &amp; Safety Standards
            </div>

            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-paper">
              Fostering safe, transparent, and{" "}
              <span className="text-[#8ea2ff]">accountable collaboration.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-paper/70 sm:text-xl">
              Creative production thrives when both clients and creators have absolute clarity regarding deliverables, milestones, and professional expectations. Learn how Reelcraft supports high-trust partnerships across every stage of work.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 text-xs font-medium text-paper/60 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-signal" /> Documented Agreements
              </span>
              <span className="h-3 w-px bg-paper/20" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-signal" /> Tracked Revisions
              </span>
              <span className="h-3 w-px bg-paper/20" />
              <span className="flex items-center gap-1.5">
                <Scale className="size-3.5 text-signal" /> Dedicated Team Support
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Guidance Sections */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {SECTIONS.map((sec, i) => (
            <motion.div
              key={sec.id}
              id={sec.id}
              {...fadeIn(i * 0.05)}
              className="scroll-mt-28 rounded-2xl border border-paper/10 bg-white/[0.025] p-8 sm:p-10 transition-colors hover:border-paper/20 hover:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-signal/15 text-[#8ea2ff]">
                      <sec.icon className="size-5" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
                      {sec.title}
                    </h2>
                  </div>

                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-paper/70">
                    {sec.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Practical Recommendations Card */}
                <div className="w-full lg:w-80 shrink-0 rounded-xl border border-paper/10 bg-white/[0.02] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8ea2ff]">
                    Recommended Practices
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {sec.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex items-start gap-2 text-xs text-paper/75 leading-relaxed">
                        <CheckCircle2 className="size-3.5 shrink-0 text-signal mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Honest Capabilities & Escalation Process */}
      <section className="border-y border-paper/10 bg-[#0d0e11] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flare">
              Platform Realities
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-paper">
              How Reelcraft handles concerns
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              We believe in honest communication regarding our moderation and platform capabilities rather than presenting fictional automation.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              {...fadeIn(0.05)}
              className="rounded-xl border border-paper/10 bg-white/[0.02] p-6"
            >
              <h3 className="font-display text-lg font-semibold text-paper">
                Human-Reviewed Reports
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-paper/60">
                When a report or inquiry is filed, it is logged directly to our internal notifications and reviewed by a member of the Reelcraft team, not an automated chatbot.
              </p>
            </motion.div>

            <motion.div
              {...fadeIn(0.1)}
              className="rounded-xl border border-paper/10 bg-white/[0.02] p-6"
            >
              <h3 className="font-display text-lg font-semibold text-paper">
                Documented Evidence
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-paper/60">
                Resolution relies upon the recorded project brief, proposal terms, uploaded file submissions, and on-platform message logs to establish factual clarity.
              </p>
            </motion.div>

            <motion.div
              {...fadeIn(0.15)}
              className="rounded-xl border border-paper/10 bg-white/[0.02] p-6"
            >
              <h3 className="font-display text-lg font-semibold text-paper">
                Account Enforcement
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-paper/60">
                Accounts found violating community standards, uploading fraudulent portfolios, or engaging in harassment are deactivated by platform administrators.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disclaimers & Legal Boundary Notice */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          {...fadeIn(0)}
          className="rounded-xl border border-paper/15 bg-white/[0.03] p-6 text-xs text-paper/60 leading-relaxed"
        >
          <div className="flex items-center gap-2 font-medium text-paper/80 uppercase tracking-wider">
            <Info className="size-4 text-signal" />
            Informational Notice &amp; Scope
          </div>
          <p className="mt-2">
            The guidance provided on this page outlines recommended practices, built-in features, and community principles intended to foster safe and respectful collaboration on Reelcraft. This document is provided for informational purposes and does not constitute a legally binding insurance guarantee, warranty of work quality, or legal contract. Both clients and creators operate as independent entities and are responsible for ensuring compliance with applicable commercial agreements and intellectual property laws.
          </p>
        </motion.div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-paper/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)}>
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-signal/15 text-[#8ea2ff]">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold text-paper">
              Need to report an issue or safety concern?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-paper/70">
              If you have noticed suspicious activity, a misleading creator profile, or experienced conduct that violates our community standards, contact our team immediately for direct review.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="signal">
                <Link href="/contact?category=trust_safety">
                  Contact Trust &amp; Safety <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-paper/25 text-paper hover:bg-paper/10"
              >
                <Link href="/about">About Reelcraft</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
