import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/explore", label: "Explore creators" },
      { href: "/register", label: "Become a creator" },
      { href: "/subscription", label: "Pricing" },
      { href: "/project/new", label: "Post a project" },
    ],
  },
  {
    title: "Specialties",
    links: [
      { href: "/explore?specialization=Motion+Designer", label: "Motion Design" },
      { href: "/explore?specialization=3D+Artist", label: "3D Art" },
      { href: "/explore?specialization=VFX+Artist", label: "VFX" },
      { href: "/explore?specialization=Video+Editor", label: "Video Editing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "About" },
      { href: "/", label: "Careers" },
      { href: "/", label: "Trust & Safety" },
      { href: "/", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink/8 bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-paper text-ink text-sm font-bold">R</span>
              Reelcraft
            </Link>
            <p className="mt-4 max-w-xs text-sm text-paper/60">
              The premium marketplace for animators, VFX artists, 3D artists, editors, and every creative professional who makes things move.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-paper">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-paper/60 transition-colors hover:text-paper">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-8 text-xs text-paper/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Reelcraft, Inc. All rights reserved.</p>
          <p>Built as a portfolio-quality demonstration project.</p>
        </div>
      </div>
    </footer>
  );
}
