"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Compass,
  Code2,
  Palette,
  Users2,
  Cog,
  Sparkles,
  Shield,
  ArrowRight,
  HeartHandshake,
  Layers,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    title: "Craftsmanship & Precision",
    description:
      "We treat software, design, and platform mechanics with the same exacting standards that top animators bring to every keyframe.",
    icon: Sparkles,
  },
  {
    title: "Respect for Creative Autonomy",
    description:
      "We believe creative talent should never be treated as interchangeable commodities. Our platform protects artist time, dignity, and value.",
    icon: Layers,
  },
  {
    title: "End-to-End Ownership",
    description:
      "Small, high-agency teams do the best work. We value people who see a challenge through from initial insight to production reality.",
    icon: Compass,
  },
  {
    title: "Collaboration Without Ego",
    description:
      "Exceptional work is forged through clear communication, thoughtful critique, mutual trust, and shared accountability.",
    icon: HeartHandshake,
  },
  {
    title: "Thoughtful Product Design",
    description:
      "We build what genuinely solves production friction—reliable reviews, predictable revisions, and clear briefs—over frivolous novelties.",
    icon: Shield,
  },
];

const DOMAINS = [
  {
    title: "Engineering",
    description:
      "Developing high-performance full-stack web applications, rich media workflows, real-time messaging, and dependable transactional pipelines.",
    skills: ["TypeScript", "Next.js", "Distributed Systems", "Media Pipelines"],
    icon: Code2,
  },
  {
    title: "Product Design",
    description:
      "Designing cinematic, functional interfaces that balance editorial sophistication with effortless utility across desktop and mobile.",
    skills: ["Design Systems", "Motion & Interaction", "Workflow UX", "Typography"],
    icon: Palette,
  },
  {
    title: "Creative Community",
    description:
      "Championing motion designers, 3D artists, and studios worldwide; curating spotlights and upholding artistic quality on the platform.",
    skills: ["Artist Relations", "Industry Outreach", "Content Curation", "Storytelling"],
    icon: Users2,
  },
  {
    title: "Marketplace Operations",
    description:
      "Ensuring fair collaboration, smooth client onboarding, dispute resolution, and responsive support for active production teams.",
    skills: ["Operational Strategy", "Trust Mediation", "Process Design", "Support"],
    icon: Cog,
  },
];

export function CareersView() {
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
              "radial-gradient(55% 45% at 65% 25%, rgba(54,84,255,0.26), transparent 70%), radial-gradient(40% 40% at 25% 75%, rgba(242,84,45,0.16), transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-wider text-paper/80 uppercase">
              <span className="size-1.5 rounded-full bg-signal" />
              Careers at Reelcraft
            </div>

            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-paper">
              Building tools for the people who{" "}
              <span className="text-[#8ea2ff]">shape visual culture.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-paper/70 sm:text-xl">
              Reelcraft is crafted for creators who bring stories to life through motion, 3D, and visual effects. We are building the foundational platform where exceptional artists collaborate with ambitious brands—with clarity, respect, and technical elegance.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="signal">
                <Link href="#openings">
                  View Openings <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-paper/30 text-paper hover:bg-paper/10"
              >
                <Link href="/contact?category=careers">Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8ea2ff]">
            How We Work
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
            Values rooted in craft and intention
          </h2>
          <p className="mt-4 text-base text-paper/70">
            We value focused execution, high individual responsibility, and genuine care for the artists and clients who rely on our platform.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((val, i) => (
            <motion.div
              key={val.title}
              {...fadeIn(i * 0.06)}
              className="rounded-2xl border border-paper/10 bg-white/[0.03] p-7 transition-all hover:border-paper/20 hover:bg-white/[0.05]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-signal/15 text-[#8ea2ff]">
                <val.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-paper">
                {val.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-paper/70">
                {val.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Domains of Contribution */}
      <section className="border-y border-paper/10 bg-[#0d0e11] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flare">
              Areas of Contribution
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
              Where we direct our energy
            </h2>
            <p className="mt-4 text-base text-paper/70">
              Building a specialized creative marketplace requires empathy across multiple disciplines, from robust software engineering to design systems and community stewardship.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {DOMAINS.map((domain, i) => (
              <motion.div
                key={domain.title}
                {...fadeIn(i * 0.08)}
                className="flex flex-col justify-between rounded-2xl border border-paper/10 bg-white/[0.025] p-8 transition-colors hover:border-paper/20 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-paper/10 text-paper">
                      <domain.icon className="size-5" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-paper">
                      {domain.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-paper/70">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-paper/10 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-paper/50">
                    Core Focus Areas
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {domain.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-paper/15 bg-white/[0.03] px-3 py-1 text-xs text-paper/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="openings" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div {...fadeIn(0)} className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8ea2ff]">
            Current Openings
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-paper">
            Open Positions
          </h2>
          <p className="mt-3 text-sm text-paper/70">
            Our published listings for engineering, design, and operations roles.
          </p>
        </motion.div>

        {/* Well-designed Empty State */}
        <motion.div
          {...fadeIn(0.1)}
          className="mx-auto mt-12 max-w-2xl rounded-2xl border border-paper/10 bg-white/[0.025] p-10 text-center sm:p-14"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-paper/15 bg-white/[0.04] text-paper/60">
            <Inbox className="size-6" />
          </div>

          <h3 className="mt-6 font-display text-2xl font-semibold text-paper">
            No active vacancies at this time
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-paper/70">
            We are not currently advertising open positions. However, as our team and platform expand, we regularly review introductions from talented engineers, designers, and community leaders who are excited about visual craft.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="signal" size="md">
              <Link href="/contact?category=careers">
                Introduce Yourself <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="md"
              className="border-paper/20 text-paper hover:bg-paper/10"
            >
              <Link href="/about">Learn More About Us</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Career Enquiry CTA Banner */}
      <section className="border-t border-paper/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div {...fadeIn(0)}>
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-signal/15 text-[#8ea2ff]">
              <Briefcase className="size-5" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold text-paper">
              Passionate about the future of creative tools?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-paper/70">
              If your background aligns with our mission and you would like to connect about future opportunities, we would love to hear from you.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" variant="signal">
                <Link href="/contact?category=careers">
                  Send a Career Enquiry <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
