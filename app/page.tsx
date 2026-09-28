import Link from "next/link";
import { desc } from "drizzle-orm";
import { Search, FileText, Users, PackageCheck, CreditCard, ShieldCheck, Zap, Repeat, Wallet, Globe, Star, Check, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { creatorProfiles, portfolioItems, subscriptionPlans } from "@/lib/db/schema";
import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/landing/reveal";
import { CreatorCard } from "@/components/explore/creator-card";
import { Button } from "@/components/ui/button";
import { SPECIALIZATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ART: Record<string, string> = {
  "Motion Designer": "gradient-1", "3D Artist": "gradient-6", "VFX Artist": "gradient-2", "Video Editor": "gradient-3",
  "Character Animator": "gradient-4", "Product Animator": "gradient-8", "CGI Artist": "gradient-7", "Compositor": "gradient-5",
};

const STEPS = [
  { icon: Search, title: "Discover", text: "Browse portfolios and services from vetted specialists." },
  { icon: FileText, title: "Post a brief", text: "Describe your project, budget and deadline in minutes." },
  { icon: Users, title: "Compare proposals", text: "Creators pitch you. Pick the right price, timeline and fit." },
  { icon: PackageCheck, title: "Review & revise", text: "Approve the cut or request revisions — all tracked." },
  { icon: CreditCard, title: "Pay & review", text: "Release payment and leave a review when it's done." },
];

const TESTIMONIALS = [
  { quote: "We went from brief to a finished 30-second spot in under two weeks. The revision flow kept everything clear.", name: "Elena Marchetti", role: "Head of Brand, Brightloop" },
  { quote: "The quality of creators is a step above every other marketplace we've tried. Proposals were sharp and honest.", name: "Marcus Webb", role: "Founder, Fern & Peak" },
  { quote: "As a compositor, I finally get briefs that are actually scoped properly, and payment that shows up on time.", name: "Freya Lindqvist", role: "Compositor" },
];

export default async function Home() {
  const [creators, work, plans] = await Promise.all([
    db.query.creatorProfiles.findMany({ with: { user: true, portfolioItems: { limit: 3 } }, orderBy: [desc(creatorProfiles.rating)], limit: 6 }),
    db.query.portfolioItems.findMany({ with: { creator: { with: { user: true } } }, orderBy: [desc(portfolioItems.createdAt)], limit: 6 }),
    db.query.subscriptionPlans.findMany({ orderBy: (t, { asc }) => [asc(t.price)] }),
  ]);
  const safeCreators = JSON.parse(JSON.stringify(creators.map((c) => ({ ...c, user: { ...c.user, passwordHash: undefined } }))));

  return (
    <>
      <Hero />

      {/* marquee */}
      <div className="overflow-hidden border-y border-ink/10 bg-paper-dim py-4" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-sm font-medium uppercase tracking-[0.2em] text-ink/50">
          {[...SPECIALIZATIONS, ...SPECIALIZATIONS, ...SPECIALIZATIONS].map((s, i) => <span key={i}>{s} <span className="mx-4 text-flare">●</span></span>)}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">Featured creators</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Top-rated talent, ready to work</h2>
          </div>
          <Link href="/explore" className="hidden items-center gap-1 text-sm font-medium text-signal hover:underline sm:flex">View all <ArrowRight className="size-4" /></Link>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {safeCreators.map((c: never, i: number) => <Reveal key={(c as { id: string }).id} delay={i * 0.06}><CreatorCard creator={c} /></Reveal>)}
        </div>
      </section>

      <section className="bg-paper-dim py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><p className="text-xs font-semibold uppercase tracking-[0.2em] text-flare">Categories</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Every discipline of visual craft</h2></Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {SPECIALIZATIONS.map((s, i) => (
              <Reveal key={s} delay={i * 0.04}>
                <Link href={`/explore?specialization=${encodeURIComponent(s)}`} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl">
                  <div className={cn(CATEGORY_ART[s], "absolute inset-0 transition-transform duration-500 group-hover:scale-110")} />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4"><span className="font-display text-lg font-semibold text-white">{s}</span></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal><p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">How it works</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">From brief to final frame</h2></Reveal>
        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <li className="relative rounded-2xl border border-ink/10 bg-white p-5">
                <span className="font-display text-4xl font-semibold text-ink/15">0{i + 1}</span>
                <s.icon className="mt-3 size-5 text-signal" />
                <p className="mt-3 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-ink py-24 text-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><p className="text-xs font-semibold uppercase tracking-[0.2em] text-flare">Featured work</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Fresh from the studio</h2></Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {work.map((w, i) => (
              <Reveal key={w.id} delay={i * 0.05}>
                <Link href={`/creator/${w.creatorId}`} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-xl"><div className={cn(w.gradient, "absolute inset-0 transition-transform duration-500 group-hover:scale-105")} /></div>
                  <p className="mt-3 text-sm font-medium">{w.title}</p>
                  <p className="text-xs text-paper/50">by {w.creator.user.name}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-24 sm:px-6 md:grid-cols-2 lg:px-8">
        <Reveal className="rounded-3xl bg-white p-8 ring-1 ring-ink/10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">For clients</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Hire with confidence</h3>
          <ul className="mt-6 space-y-4">
            {[{ i: ShieldCheck, t: "Vetted specialists with transparent ratings" }, { i: Zap, t: "Proposals in hours, not weeks" }, { i: Repeat, t: "Structured revisions so nothing gets lost" }].map((x) => (
              <li key={x.t} className="flex items-center gap-3 text-sm"><x.i className="size-5 text-signal" /> {x.t}</li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1} className="rounded-3xl bg-signal p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">For creators</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Do the work you love</h3>
          <ul className="mt-6 space-y-4">
            {[{ i: Globe, t: "Get discovered through a portfolio-first profile" }, { i: Wallet, t: "Clear scopes and reliable payment" }, { i: Star, t: "Build a reputation with verified reviews" }].map((x) => (
              <li key={x.t} className="flex items-center gap-3 text-sm"><x.i className="size-5" /> {x.t}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="bg-paper-dim py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><h2 className="font-display text-4xl font-semibold tracking-tight">Loved by both sides of the brief</h2></Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="h-full rounded-2xl bg-white p-6 ring-1 ring-ink/10">
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-amber-400 text-amber-400" />)}</div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-ink/80">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 text-sm"><span className="font-semibold">{t.name}</span><br /><span className="text-muted">{t.role}</span></figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal className="text-center"><h2 className="font-display text-4xl font-semibold tracking-tight">Simple plans</h2><p className="mt-2 text-muted">Start free. Scale when your slate grows.</p></Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <div className={cn("flex h-full flex-col rounded-2xl border p-6", p.highlighted ? "border-signal bg-ink text-paper" : "border-ink/10 bg-white")}>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="mt-2 text-3xl font-semibold">${p.price}<span className="text-sm font-normal opacity-60">/mo</span></p>
                <ul className="mt-4 flex-1 space-y-2">{(JSON.parse(p.features) as string[]).slice(0, 3).map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-signal" /> {f}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center"><Button asChild variant="outline"><Link href="/subscription">Compare plans</Link></Button></div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center text-paper" >
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your next great cut starts here.</h2>
          <p className="mx-auto mt-4 max-w-lg text-paper/70">Post a project in five minutes and hear from top creators today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="signal"><Link href="/register">Get started free</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-paper/30 text-paper hover:bg-paper/10"><Link href="/explore">Explore Creators</Link></Button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
