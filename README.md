# Reelcraft

**A premium marketplace for creative professionals** — animators, motion designers, VFX artists, 3D/CGI artists, video editors and compositors. Clients discover talent, post projects, compare proposals, manage revisions, approve work, pay (mock) and review. Creators build profiles and portfolios, sell services, win projects and get paid. Admins monitor the platform.

This is a real full-stack app: every workflow reads and writes a SQLite database through server-enforced business rules.

## Quick start

```bash
npm install
cp .env.example .env        # then set SESSION_SECRET to any long random string
npm run db:migrate          # creates reelcraft.db from the SQL migration
npm run seed                # loads demo data
npm run dev                 # http://localhost:3000
```

(`npm run setup` runs `db:migrate` + `seed` together.)

### Demo accounts (password for all: `Password123!`)

| Role | Email |
|---|---|
| Client | client@example.com |
| Creator | creator@example.com |
| Admin | admin@example.com |

Seed also creates 7 more creators (`noor@`, `diego@`, `hana@`, `leo@`, `amara@`, `viktor@`, `freya@example.com`) and 3 more clients. The login page has "Use demo …" shortcuts.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm run db:migrate` | Apply SQL migrations in `drizzle/` |
| `npm run db:push` | Sync schema directly from `lib/db/schema.ts` (dev shortcut) |
| `npm run seed` | Wipe + reseed demo data |
| `npm test` | Vitest business-logic tests (29 tests) |
| `npm run test:e2e` | Full 25-step marketplace journey + authorization checks against a **running** server (`BASE_URL` to override) |
| `npm run typecheck`, `npm run lint` | Static checks |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Radix UI primitives (shadcn-style hand-built components) · Framer Motion · Three.js / React Three Fiber / drei · Recharts · React Hook Form + Zod · **Drizzle ORM + better-sqlite3** · bcryptjs · jose (JWT session cookies) · Vitest.

> **Why Drizzle instead of Prisma?** Prisma downloads native engine binaries from `binaries.prisma.sh` at install time. The environment this project was built in blocks that host, so Prisma could not be installed. Drizzle gives the same relational schema, constraints and typed queries with no binary download. The schema (`lib/db/schema.ts`) maps 1:1 to the entities requested.

## Architecture

```
app/                    routes (pages + app/api route handlers)
  api/                  REST-style JSON API, one folder per resource
components/             ui/ layout/ landing/ explore/ creator/ admin/ projects/ portfolio/ notifications/
lib/
  db/                   schema.ts, client, seed/
  auth/                 session (JWT cookie), guards (requireUser/requireRole), client context
  services/             project-state-machine, payments (mock gateway), notifications, email (mock), settings, project-access
  validations/          Zod schemas shared by client forms and API handlers
hooks/  types/  tests/  scripts/  drizzle/ (SQL migrations)
proxy.ts                route-level role protection (Next 16 "proxy", formerly middleware)
```

Layers: **UI → API route handlers → services/validation → Drizzle**. Handlers wrap logic in `handleRoute`, which maps Zod/auth/app errors to consistent JSON errors.

### Security model
- Passwords hashed with bcrypt; hashes are never returned by any API.
- Session = signed (HS256) httpOnly cookie. Role comes from the signed token and is re-checked against the database per request where it matters; roles are never taken from client input (self-registration only allows CLIENT/CREATOR).
- **Authorization is enforced server-side twice**: `proxy.ts` redirects wrong-role page visits, and every API handler calls `requireRole`/ownership checks (e.g. only the owning client can accept a proposal, only the assigned creator can submit work, only participants can review).
- Deactivated users cannot log in. All input is validated with Zod; IDs are looked up, not trusted.

### Project state machine (`lib/services/project-state-machine.ts`)
```
DRAFT → OPEN → PROPOSALS_RECEIVED → FREELANCER_SELECTED → IN_PROGRESS → SUBMITTED → APPROVED → PAYMENT_PENDING → COMPLETED
                                                              ↑              ↓
                                                              └─ REVISION_REQUESTED
(any non-terminal → CANCELLED; failed payment returns PAYMENT_PENDING → APPROVED so it can be retried)
```
Every mutating endpoint calls `assertTransition`, so invalid jumps return `409`.

### Database
15 tables: users, creator_profiles, portfolio_items, services, subscription_plans, subscriptions, projects, proposals, project_files, revisions, payments, reviews, notifications, messages, platform_settings. Includes foreign keys (cascade where children are owned), unique indexes (`users.email`, one proposal per creator per project, one review per reviewer per project, unique payment transaction IDs), and query indexes. Extras beyond the brief: `projects.agreedPrice/agreedRevisions` (frozen from the accepted proposal), `payments.platformFee`, `project_files.kind` (REFERENCE/SUBMISSION), `platform_settings` (admin-configurable fee and registration toggle).

## Features
- **Landing**: cinematic hero with a lazy-loaded Three.js scene (floating frames, particles, mouse parallax) and an automatic static-CSS fallback when WebGL is unavailable or `prefers-reduced-motion` is set; scroll reveals; all requested sections.
- **Explore** with search, specialty/availability/rate/rating filters and sorting; **creator profile** with portfolio modal, services, reviews and hire CTA.
- **Client**: 5-step project wizard (data preserved between steps; publish or save draft), proposal comparison/accept/decline, workspace, approval, revision requests, mock payment, reviews, dashboard, subscription plans (functional purchase).
- **Creator**: profile, portfolio and service management (CRUD), opportunities, proposals, workspace (start/submit/resubmit), earnings, reviews, dashboard with profile-completion score.
- **Admin**: overview, users (deactivate/reactivate), creators, projects, payments, reports (Recharts), settings (platform fee %, registration toggle — actually applied to new payments/registrations).
- **Notifications** (DB-backed bell, page, mark read/all), **messages** (DB-backed threads, polling refresh).

## Mock payments & how to add Stripe
`lib/services/payments.ts#chargePayment` simulates a gateway (a card ending `0000` is declined so the failure path is testable). The payment route (`app/api/projects/[id]/payment/route.ts`) only depends on the `ChargeInput`/`ChargeResult` contract. To integrate Stripe: implement `chargePayment` with `stripe.paymentIntents.create` (or Checkout), add a webhook route that flips the `payments` row and project status, and add `STRIPE_SECRET_KEY` to `.env`.

## File storage
Uploads are **metadata-only** in this version: `project_files` records name/type/size/kind/note and a `/mock-storage/...` URL; no bytes are stored. To use real storage, accept a multipart upload in `app/api/projects/[id]/files/route.ts` and `submit/route.ts`, write to S3/R2/Cloudinary, and store the returned URL in `fileUrl`.

## Email
`lib/services/email.ts#sendMockEmail` logs instead of sending; `createNotification` calls it. Swap in Resend/Postmark/SES there.

## Deployment
SQLite needs a persistent disk. Simplest: a single VM/container (Fly.io volume, Railway volume, VPS) — set `DATABASE_URL` to a path on the volume, set a strong `SESSION_SECRET`, run `npm run build && npm run db:migrate && npm start`. For serverless hosts (Vercel), switch the Drizzle driver to Postgres/Turso/libSQL first — the schema is portable with small dialect changes.

## Troubleshooting
- **`SESSION_SECRET is not set`** → create `.env` from `.env.example`.
- **`no such table`** → run `npm run db:migrate`.
- **Reset demo data** → `npm run seed` (wipes and reseeds) or delete `reelcraft.db` and re-run migrate + seed.
- **`npm install` fails inside `better-sqlite3` / `node-gyp`** → better-sqlite3 v13 bundles prebuilt binaries for Linux/macOS/Windows (x64 + arm64), so the compile step isn't needed. Run `npm install --ignore-scripts` (this is how the clean-room verification of this project was done). Node 22+ is required.
- **Blank hero visual** → WebGL disabled or reduced motion on; the static fallback is used by design.

## Known limitations
File upload and email are mocked; messaging is polling, not WebSockets; the UI has not been cross-browser tested, and responsive layouts were built with mobile-first Tailwind but only verified by build/HTTP checks, not on physical devices.
