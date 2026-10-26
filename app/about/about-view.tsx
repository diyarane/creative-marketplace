"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Clapperboard,
  ArrowRight,
  Workflow,
  CheckCircle2,
  Sliders,
  Boxes,
  Eye,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPECIALIZATIONS } from "@/lib/constants";

const DISCIPLINE_DETAILS: Record<
  string,
  { label: string; description: string; gradient: string }
> = {
  "Motion Designer": {
    label: "Motion Design",
    description: "Kinetic typography, brand identity systems, UI transitions, and broadcast motion.",
    gradient: "gradient-1",
  },
  "3D Artist": {
    label: "3D Art & Modeling",
    description: "Detailed 3D assets, stylized character work, environments, and scene lighting.",
    gradient: "gradient-6",
  },
  "VFX Artist": {
    label: "Visual Effects",
    description: "Digital matte painting, rig removal, simulation, green screen, and dynamic effects.",
    gradient: "gradient-2",
  },
  "Video Editor": {
    label: "Video Editing",
    description: "Commercials, brand films, rhythmic pacing, sound assembly, and final color pass.",
    gradient: "gradient-3",
  },
  "Character Animator": {
    label: "Character Animation",
    description: "2D & 3D character performance, expressive acting, skeletal rigging, and walk cycles.",
    gradient: "gradient-4",
  },
  "Product Animator": {
    label: "Product Animation",
    description: "CAD visualization, exploded views, tactile material rendering, and launch films.",
    gradient: "gradient-8",
  },
  "CGI Artist": {
    label: "CGI & Simulation",
    description: "Complex physics sims, photorealistic rendering, particle systems, and architectural viz.",
    gradient: "gradient-7",
  },
  "Compositor": {
    label: "Compositing",
    description: "Multi-pass EXR integration, beauty clean-up, depth compositing, and visual polish.",
    gradient: "gradient-5",
  },
};

const STEPS = [
  {
    step: "01",
    title: "Curated Discovery",
    desc: "Browse verified creative portfolios organized by discipline, visual aesthetics, and proven project track record.",
    icon: Eye,
  },
  {
    step: "02",
    title: "Structured Briefs & Proposals",
    desc: "Clients post clear deliverables with budget parameters; creators reply with tailored scopes and defined revision allowances.",
    icon: Sliders,
  },
  {
    step: "03",
    title: "Dedicated Project Workspace",
    desc: "Keep files, direct messaging, milestone updates, and formal revision requests in one unified project hub.",
    icon: Workflow,
  },
  {
    step: "04",
    title: "Tracked Milestones & Reviews",
    desc: "Payments are held safely until deliverable sign-off. Completed projects unlock authentic, verified reviews.",
    icon: FileCheck2,
  },
];

const CLIENT_BENEFITS = [
  "Direct access to specialized motion, 3D, and VFX talent without agency markups.",
  "Upfront clarity on deliverables, turnaround times, and included revision rounds.",
  "Centralized project workspaces keeping assets, feedback, and milestones organized.",
  "Authentic client reviews tied strictly to verified completed projects.",
];

const CREATOR_BENEFITS = [
  "A dedicated platform that respects the nuance, technical overhead, and timeline of motion craft.",
  "Protection against endless scope creep through formalized, tracked revision requests.",
  "Direct collaboration with clients who understand the value of bespoke animation and visual effects.",
  "Portfolio-centric profile pages with zero commissions on creative autonomy.",
];

export function AboutView() {
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
              "radial-gradient(55% 45% at 70% 30%, rgba(54,84,255,0.28), transparent 70%), radial-gradient(40% 40% at 20% 80%, rgba(242,84,45,0.18), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wider text-paper/80 uppercase">
              <span className="size-1.5 rounded-full bg-signal" />
              Our Mission
            </div>

            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-paper">
              Connecting exceptional vision with the specialists who{" "}
              <span className="text-[#8ea2ff]">make ideas move.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-paper/70 sm:text-xl">
              Reelcraft was built to solve a simple problem: motion design, 3D art, VFX, and animation are among the most demanding creative disciplines in production, yet finding and managing specialized talent on generic freelance boards remains chaotic and ill-fitting.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-paper/60 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-signal" /> 8 Dedicated Disciplines
              </span>
              <span className="h-3 w-px bg-paper/20" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-signal" /> Structured Revision Tracking
              </span>
              <span className="h-3 w-px bg-paper/20" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-signal" /> Direct Artist Collaboration
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flare">
            The Industry Challenge
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
            Why generic marketplaces fall short for visual craft
          </h2>
          <p className="mt-4 text-base leading-relaxed text-paper/70">
            Broad freelance platforms treat a 60-second 3D simulation the same way they treat a text translation. But motion production requires precise briefs, render pipeline empathy, defined revision rounds, and high-fidelity video review.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* For Clients */}
          <motion.div
            {...fadeIn(0.1)}
            className="rounded-2xl border border-paper/10 bg-white/[0.03] p-8 transition-colors hover:border-paper/20 hover:bg-white/[0.05]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-signal/15 text-[#8ea2ff]">
              <Clapperboard className="size-5" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-paper">
              The Client Dilemma
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              On traditional freelance hubs, reviewing talent means sifting through hundreds of irrelevant bids, noisy stock templates, and ambiguous capability claims. Evaluating motion reels requires specialized context that standard job boards simply do not accommodate.
            </p>
            <div className="mt-6 border-t border-paper/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8ea2ff]">
                How Reelcraft solves it
              </p>
              <p className="mt-2 text-sm text-paper/80">
                A focused environment where portfolios highlight actual animation craft, categories reflect genuine studio specializations, and proposals explicitly commit to milestones and revision counts before work begins.
              </p>
            </div>
          </motion.div>

          {/* For Creators */}
          <motion.div
            {...fadeIn(0.2)}
            className="rounded-2xl border border-paper/10 bg-white/[0.03] p-8 transition-colors hover:border-paper/20 hover:bg-white/[0.05]"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-flare/15 text-flare">
              <Layers className="size-5" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-paper">
              The Creator Reality
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              Motion designers and VFX artists constantly battle vague briefs, endless cycles of uncompensated &ldquo;small tweaks,&rdquo; and price-driven competition from low-effort templates. Technical rendering time and compositing craft are frequently misunderstood.
            </p>
            <div className="mt-6 border-t border-paper/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-flare">
                How Reelcraft solves it
              </p>
              <p className="mt-2 text-sm text-paper/80">
                A platform designed around production realities: clear brief specifications, creator-defined service packages, formal revision tracking with clear status boundaries, and direct client communication.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Disciplines */}
      <section className="border-y border-paper/10 bg-[#0d0e11] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8ea2ff]">
                Eight Specialized Disciplines
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
                Engineered for visual storytelling
              </h2>
            </div>
            <p className="max-w-md text-sm text-paper/60">
              Rather than attempting to serve every freelance trade, Reelcraft is purposely tailored to the specialized crafts of moving image production.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALIZATIONS.map((spec, i) => {
              const info = DISCIPLINE_DETAILS[spec] || {
                label: spec,
                description: "Specialized visual craft on Reelcraft.",
                gradient: "gradient-1",
              };
              return (
                <motion.div
                  key={spec}
                  {...fadeIn(i * 0.05)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-paper/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-paper/20 hover:bg-white/[0.05]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-paper/40">0{i + 1}</span>
                      <div className={`size-3 rounded-full ${info.gradient}`} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-paper group-hover:text-[#8ea2ff] transition-colors">
                      {info.label}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-paper/60">
                      {info.description}
                    </p>
                  </div>
                  <Link
                    href={`/explore?specialization=${encodeURIComponent(spec)}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#8ea2ff] hover:underline"
                  >
                    View creators <ArrowRight className="size-3" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How the Marketplace Works */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">
            Production Flow
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
            From initial concept to final render
          </h2>
          <p className="mt-4 text-sm text-paper/70">
            A structured workflow designed to provide predictability for commissioning clients and protection for working artists.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              {...fadeIn(i * 0.08)}
              className="relative rounded-2xl border border-paper/10 bg-white/[0.03] p-6 transition-colors hover:border-paper/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-paper/40">{s.step}</span>
                <s.icon className="size-5 text-signal" />
              </div>
              <h3 className="mt-5 font-semibold text-paper">{s.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-paper/60">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mutual Benefits */}
      <section className="border-t border-paper/10 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Clients side */}
            <motion.div {...fadeIn(0)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1 text-xs font-medium text-paper/80">
                <Boxes className="size-3.5 text-signal" /> For Brands &amp; Production Teams
              </div>
              <h3 className="mt-4 font-display text-3xl font-semibold text-paper">
                A predictable partner for your motion pipeline
              </h3>
              <p className="mt-3 text-sm text-paper/70">
                Whether you need a bespoke kinetic identity, a photorealistic 3D product reveal, or clean VFX plate work, Reelcraft gives you direct access to skilled practitioners.
              </p>
              <ul className="mt-6 space-y-3">
                {CLIENT_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-paper/80">
                    <CheckCircle2 className="size-4 shrink-0 text-signal mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Creators side */}
            <motion.div {...fadeIn(0.15)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-3 py-1 text-xs font-medium text-paper/80">
                <Sparkles className="size-3.5 text-flare" /> For Independent Artists &amp; Animators
              </div>
              <h3 className="mt-4 font-display text-3xl font-semibold text-paper">
                Respecting your craft, time, and independence
              </h3>
              <p className="mt-3 text-sm text-paper/70">
                We believe exceptional artists deserve clients who respect the craft. Reelcraft protects your schedule with clear revision boundaries and milestone escrow.
              </p>
              <ul className="mt-6 space-y-3">
                {CREATOR_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-paper/80">
                    <CheckCircle2 className="size-4 shrink-0 text-flare mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-paper/10 py-20 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(54,84,255,0.4), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)}>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
              Ready to create something remarkable?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-paper/70">
              Browse world-class motion talent or create your creator portfolio today. Join a community where visual craft comes first.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="signal">
                <Link href="/explore">
                  Explore Creators <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-paper/30 text-paper hover:bg-paper/10"
              >
                <Link href="/register?role=creator">Become a Creator</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
