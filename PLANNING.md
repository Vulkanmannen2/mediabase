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
