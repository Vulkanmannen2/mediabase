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
