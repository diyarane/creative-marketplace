"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false, loading: () => null });

export function Hero() {
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = React.useState(false);
  React.useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!reduce && !!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, [reduce]);

  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(60% 50% at 75% 40%, rgba(54,84,255,0.35), transparent 70%), radial-gradient(40% 40% at 15% 90%, rgba(242,84,45,0.25), transparent 70%)" }} />
      <div className="relative mx-auto grid min-h-[86vh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <motion.p {...item(0)} className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-3.5 py-1.5 text-xs font-medium tracking-wide text-paper/80">
            <span className="size-1.5 animate-pulse rounded-full bg-flare" /> NOW ROLLING — 8 disciplines, one marketplace
          </motion.p>
          <motion.h1 {...item(1)} className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Hire the people who make things <em className="text-signal not-italic" style={{ color: "#8ea2ff" }}>move.</em>
          </motion.h1>
          <motion.p {...item(2)} className="mt-6 max-w-lg text-lg text-paper/70">
            Reelcraft connects brands with vetted animators, VFX artists, 3D artists, editors and compositors — from brief to final frame, with proposals, revisions and payment in one place.
          </motion.p>
          <motion.div {...item(3)} className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="signal">
              <Link href="/explore">Explore Creators <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-paper/30 text-paper hover:bg-paper/10">
              <Link href="/register?role=creator">Become a Creator</Link>
            </Button>
          </motion.div>
          <motion.div {...item(4)} className="mt-10 flex items-center gap-6 text-sm text-paper/60">
            <span><strong className="text-paper">2,400+</strong> projects delivered</span>
            <span className="h-4 w-px bg-paper/20" />
            <span><strong className="text-paper">4.8</strong> avg. rating</span>
          </motion.div>
        </div>

        <div className="relative h-[420px] lg:h-[560px]" role="img" aria-label="Floating portfolio frames representing creative work">
          {webgl ? <HeroScene /> : <StaticFrames />}
          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-paper/15 bg-ink/60 px-4 py-2 text-xs text-paper/70 backdrop-blur">
            <Play className="size-3 fill-current" /> 00:00:12:08 — timeline
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticFrames() {
  const frames = [
    { c: "gradient-1", cls: "left-[20%] top-[22%] h-40 w-64 animate-float-slow" },
    { c: "gradient-2", cls: "left-[2%] top-[8%] h-28 w-44 animate-float-slower" },
    { c: "gradient-4", cls: "right-[2%] top-[52%] h-32 w-48 animate-float-slower" },
    { c: "gradient-6", cls: "right-[12%] top-[6%] h-24 w-36 animate-float-slow" },
  ];
  return (
    <div className="absolute inset-0">
      {frames.map((f, i) => <div key={i} className={`${f.c} ${f.cls} absolute rounded-xl border border-paper/30 shadow-2xl`} />)}
    </div>
  );
}
