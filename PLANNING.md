# Mediabase — Project Plan

## What It Is

A service for uploading, organizing, and playing audio and video
files. Open source, Apache 2.0. GitHub: Vulkanmannen2.

## Development tools

- Repo on GitHub (public).
- `.gitignore` set for Next.js build artifacts, env files, Prisma local
  artifacts, OS/editor files, media directories (`/uploads/`, `/media/`, `/storage/`).
- Editor: VS Code — Prisma, ESLint, Tailwind CSS IntelliSense, GitLens.

## Stack / Infrastructure

| Layer | Choice |
|---|---|
| Version control | GitHub (public) |
| Hosting | Hetzner VPS |
| Deployment tooling | Coolify (self-hosted) |
| CI/CD | GitHub Actions |
| DNS | Loopia → Hetzner VPS |
| Database | PostgreSQL on the VPS (Coolify/Docker) |
| SSL / reverse proxy | Coolify's built-in Traefik |
| Process management | Docker restart policy (via Coolify) |

## Deployment Workflow (v1)

1. Edit locally
2. Push to GitHub
3. SSH to VPS
4. Pull, build; Coolify redeploys the container (Docker restart policy)
5. Coolify's built-in proxy handles domain + SSL

GitHub Actions to eventually automate steps 3–4.

## Branching

`main` (production) · `dev` (integration) · feature branches as needed.

## Step Two: Cloudflare R2

Move media storage from local filesystem to Cloudflare R2. Storage-layer only
— no app logic changes beyond the storage adapter. Starts only after v1 is
deployed and stable.

R2 specifically, not S3 or similar: R2 has no egress fees, so cost scales
with storage held, not with how much people stream — the right shape for a
media-streaming app where usage cost should stay predictable as listening/
watching grows.

## Path to Launch

Four things need to happen before this is ready for real (non-test) users.
Scoped in conversation on 2026-09-11; not yet built.

1. **Storage migration to Cloudflare R2** (see Step Two, above). The longer
   this waits, the more uploaded media accumulates on local VPS disk and has
   to be migrated later — do this one early, independent of the others.

2. **Payments** — member fees, and payout splits to creators
   (`PayoutSplit`, already in the data model). Likely vehicle: Stripe
   Connect or equivalent. Connect-style providers also handle payee
   identity verification (KYC, tax info, bank details) as part of payout
   onboarding — but only for people who actually receive a payout, not
   every uploader. Doesn't satisfy the copyright-accountability need in
   item 3 below; that has to be a separate gate.

3. **Creator identity verification** — every creator verifies with BankID
   (Sweden) or an equivalent strong eID, regardless of whether they ever
   receive a payout. Purpose is copyright accountability: an unbroken,
   non-repudiable link between an uploaded item and the real person
   responsible for it — not a payment requirement.
   - Direct BankID integration needs a bank Relying Party agreement — too
     heavy for this project. Integrate via a broker instead.
   - Starting point: **Signicat**, EU-first. Covers BankID plus other
     eIDAS-notified national eID schemes (MitID, itsme, SPID, etc.) behind
     one integration, so EU creators beyond Sweden are covered without
     extra work.
   - Outside the EU: no bank-grade eID equivalent exists. Fallback would be
     document-based verification (Stripe Identity, Veriff, Onfido) — a
     meaningfully lower assurance tier than bank-backed eID. Not being
     built now — EU-first, revisit if/when non-EU creators are actually
     onboarding.
   - Verification frequency is still open. Original idea was BankID on
     every creator login; re-verifying only at signup plus at consequential
     actions (uploading, changing payout details) would give the same
     accountability at a fraction of the per-check cost and login friction.
     Not decided.
   - Identity verification alone does not give the platform legal
     safe-harbor for hosted content. EU host-liability rules (e-Commerce
     Directive / DSA) additionally require a notice-and-takedown process
     and Terms of Service under which creators warrant they own or hold
     the rights to what they upload. Neither exists yet. Get real legal
     review before relying on any of this — this is liability territory,
     not just an engineering decision.

4. **Full frontend build** — Home, the 4 screen patterns (Grid/List/Feed),
   Collection Detail, and Player shipped 2026-09-11 (see `APP-DESIGN.html`).
   Remaining: creator/account-management surfaces that don't exist yet
   (payout-split editing, tag management, etc.).

### GDPR

Applies regardless of the above four items — not something to design
around. Existing user accounts (email, listening activity) and any future
payment/membership records are already personal data in scope today,
independent of the creator-identity work; even bare IP-address logging
counts as personal data. It cannot be opted out of by simply not storing a
field like email.

Two tiers going forward:
- **Regular users** — standard tier: a privacy policy, a lawful basis
  (service necessity), and the basic data-subject rights (access, export,
  deletion). Low lift, well-trodden ground.
- **Creators** — heavier tier: verified legal identity, longer retention
  for accountability. If the eID flow includes a face/liveness check, that
  is biometric data used for identification — GDPR's stricter Article 9
  "special category" rules apply, not just the standard lawful basis.

Data minimization (collect only what's actually needed) reduces the
compliance burden but does not remove GDPR's applicability.

## Later / Under Consideration

- Remote Claude Code sessions via the Hetzner VPS (convenience layer, not
  primary workflow).
- At-scale candidates: MinIO, FFmpeg + BullMQ, Keycloak, Meilisearch, Umami, tus.
- Native apps: iOS (Swift/SwiftUI), Android (Kotlin/Jetpack Compose),
  desktop (Tauri) — after web v1 is stable.

## Ground Rules

- Infra work (Coolify — Docker, proxy, restarts) stays separate from app code.
- R2 migration is an explicit step two, not a side effect of other tasks.
- One tool per job.
- Full tech reference: `STACK.md`.

## Specification Version 1

1. **Data model** — Next.js + Prisma + Postgres. `Media { id, title, type,
   filePath, mimeType, durationSeconds, createdAt }`.
2. **Seed data** — 3–5 files in `/public/media`, seed script inserts
   matching rows.
3. **API** — `GET /api/media`, `GET /api/media/:id`; range-request support
   required (seeking).
4. **Frontend** — one dark-themed page: list → click → play in
   `<audio>`/`<video>`. No auth, no uploads.
5. **Deploy** — Hetzner VPS via Coolify, confirm SSL, confirm GitHub
   Actions triggers deploy on push to `main`.

Deferred: auth, uploads UI, consumption tracking/payouts, Cloudflare R2,
transcoding.

## Specification Version 2

**Goal:** two pages instead of one hand-seeded library — upload and
consume — behind a login. No payments, no payout logic, no creator/
consumer role split.

1. **Auth** — Auth.js (NextAuth) with the Prisma adapter, email/password
   provider. Adds `User`, `Account`, `Session` models. New env var
   (`AUTH_SECRET`) in local `.env` and in Coolify.
2. **Data model** — `Media.uploaderId → User.id`. Any logged-in user can
   both upload and consume; no separate roles.
3. **Upload page** — authenticated route: form (title, file picker) →
   validate type/size → save to `/public/media/<type>/` → insert `Media`
   row with `uploaderId`. Still local disk, same as v1.
4. **Consume page** — existing list/player, gated behind login, shows
   uploader name.
5. **Media serving has to change** — the static `/public` handler only
   knows about files that existed when the app process started (this is
   why the v1 seed upload needed a manual container restart — see
   `ARCHITECTURE.html`). Fine for a one-time seed, not fine for live user
   uploads. v2 needs a small custom route (`GET /api/media/:id/file`)
   that reads the file from disk on every request instead, so a fresh
   upload is playable immediately, no restart.

Deferred — not yet scoped as a version: payments/subscriptions,
consumption-based payout calculation, creator/consumer roles, resumable
uploads (`tus`), R2.

## Specification — Full Application

**Goal:** two-sided app — anyone logged in can upload, anyone logged in can
browse and play — instead of a single hand-seeded library. The fuller
shape v2 is a step toward; not scoped for a single build.

1. **Auth** — Auth.js (NextAuth) with the Prisma adapter. Email/password to
   start; OAuth providers can follow later. Adds `User`, `Account`,
   `Session` models per Auth.js's schema. Keycloak stays a possible
   at-scale swap (`STACK.md`), not needed yet.
2. **Data model** — `Media.uploaderId → User.id`. No separate creator/
   consumer role — matches the declaration's "anyone can publish"
   vision; every logged-in user can do both.
3. **Upload** — authenticated route: form (title, file picker) → validate
   type/size → save to `/public/media/<type>/` → insert `Media` row with
   `uploaderId`. Still local disk, same as v1. User-generated uploads make
   the R2 migration (Step Two, above) more urgent than it was, but it
   stays a separate task, not a side effect of shipping upload.
4. **Consume** — existing list/player UI, extended to show uploader name.
   Gated behind login only — no payment/subscription logic yet.
5. **Access control** — logged-out visitors see a login/signup prompt,
   nothing else. No public/anonymous browsing.

Deferred beyond this: payments/subscriptions, consumption-based payout
calculation (the actual creator-compensation mechanic from
`MEDIABASE DECLARATION.md`), creator vs. consumer roles, resumable
uploads (`tus`) for large files.
