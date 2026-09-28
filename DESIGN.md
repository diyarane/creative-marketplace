# Reelcraft — Design System

## Concept
Reelcraft's identity borrows from the edit suite and the film slate: a near-black "ink" canvas for cinematic moments (hero, featured work, footer), a cool porcelain "paper" for working surfaces, one electric **signal blue** for primary action, and a hot **flare orange** — the record light — used sparingly for emphasis and notifications. The wordmark is a lowercase-feeling serif "Reelcraft" with a rounded "R" monogram (also the favicon, inline SVG).

## Palette
| Token | Value | Use |
|---|---|---|
| ink | `#101114` | text, dark sections, primary buttons |
| ink-soft | `#1c1e22` | hover on dark |
| paper | `#f2f0ea` | page background |
| paper-dim | `#e7e4db` | alternating sections |
| line | `#dcd8cd` | borders |
| muted | `#6c6e70` | secondary text |
| signal | `#3654ff` | primary accent, focus rings, links |
| flare | `#f2542d` | notification badges, highlights |
| success | `#1c8a5b` | positive states |

Procedural artwork uses eight named gradients (`.gradient-1…8`) built from these colors — used for avatars, portfolio covers and category tiles, so there are no external image dependencies.

## Typography
System-font stacks only (no network font downloads, faster and offline-safe): display uses a serif stack (`Georgia`, Iowan Old Style, Palatino) for editorial weight; UI uses the platform sans. Tracking is tightened on large display sizes; small caps-style eyebrow labels use wide letter-spacing.

## Components
Hand-built, Radix-backed primitives in `components/ui`: Button (primary, signal, flare, outline, ghost, subtle, destructive), Input/Textarea/Select, Card, Badge, Avatar, Tabs, Dialog, Dropdown, Checkbox, Progress, Skeleton, Toast, EmptyState, StatCard. Radii: pill for buttons/badges, 12–16px for cards and inputs. Shadows are reserved for hover elevation and floating layers; there is no blanket glassmorphism (only the sticky header and hero chip use a light blur).

Status colours for project states are defined once (`lib/project-status.ts`) and reused in badges everywhere.

## Motion
- **Hero**: staggered text entrance (Framer Motion), a lazy-loaded React Three Fiber scene (floating framed "portfolio cards", drifting particles, pointer parallax) with a CSS-animated static fallback.
- **Scroll**: one-shot fade-up reveals with small stagger (`Reveal`); a slow marquee of disciplines.
- **Micro-interactions**: card lift on hover, image scale on portfolio tiles, dialog/dropdown/toast entrances, progress bar transitions, skeleton pulses.
- **Principle**: motion signals hierarchy or state change; it is never required to use the UI.
- **Reduced motion**: `prefers-reduced-motion` disables CSS animation globally, and the hero uses `useReducedMotion` to skip entrance animation and the 3D scene.

## Performance
The Three.js bundle is `dynamic()`-imported client-only, with DPR capped at 1.5, ~140 particles and 5 meshes. Landing data is fetched server-side in one parallel batch.

## Responsive strategy
Mobile-first Tailwind. Header collapses to a menu button below `lg`; grids step 1→2→3 columns; data tables scroll horizontally inside their own container; messages switch between list and thread views on small screens; the project wizard hides step labels on narrow screens; dashboards stack cards.

## Accessibility
Semantic landmarks (`header`, `main`, `nav`, `footer`, `section`, `ol` for steps); labelled inputs; `aria-label`s on icon buttons; Radix dialogs/menus provide focus trapping and keyboard support; global visible `:focus-visible` ring in signal blue; alerts use `role="alert"`; the hero visual has a text alternative; text/background pairings use ink on paper or white on ink/signal.

## Interaction principles
1. Every button performs a real action or navigates.
2. Every async view has loading (skeleton), empty, and error states.
3. Destructive actions confirm; success and failure produce toasts.
4. The server is the authority — the UI hides what a role can't do, but the API refuses it regardless.
