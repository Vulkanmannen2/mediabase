# Mercito — Technology Stack

Reference doc for every tool/technology in the stack and the job it does.
See `PLANNING.md` for architecture decisions, reasoning, and roadmap.

## Application

| Component | Choice | Job |
|---|---|---|
| Frontend/backend framework | Next.js 14 | App logic, routing, server + client rendering |
| ORM | Prisma | Type-safe database access layer |
| Database | PostgreSQL | Stores metadata (users, media records, playlists, etc.) |
| Media storage | Cloudflare R2 — bucket `mercito-media`, EU jurisdiction | Stores the actual audio/video files. Private bucket: browsers play and upload through short-lived presigned URLs, so file bytes never pass through the VPS. Local dev uses `/public/media` instead (`STORAGE_DRIVER` unset) |
| UI | Dark-themed, audio/video tabs | Core interface for browsing and playing media |

## Infrastructure

| Component | Choice | Job |
|---|---|---|
| Version control | GitHub (public, Apache 2.0) | Source code hosting |
| Hosting | Hetzner VPS (Europe, ~€5–7/mo) | Runs the app, the docs site, and the database |
| Deployment tooling | Coolify (self-hosted) | Infra-layer orchestration — Docker, services, env vars, SSL/reverse proxy (built-in Traefik), and container restarts. Does not touch app code |
| CI/CD | None yet (GitHub Actions planned) | Deploys are a manual **Redeploy** in Coolify after pushing to `main` |
| DNS | Loopia | Holds the DNS for `mercito.org` — A records for the root, `www`, `docs` and `about` all point at the Hetzner VPS's IP. Not involved once traffic arrives at the server |
| Editor | VS Code | Development environment — recommended extensions: Prisma, ESLint, Tailwind CSS IntelliSense, GitLens |

## Candidates Explored for Future Scale (not yet adopted)

| Function | Candidate | Notes |
|---|---|---|
| Object storage (self-hosted alt.) | MinIO | Open source S3-compatible storage, alternative to managed R2 |
| Transcoding / job queues | FFmpeg + BullMQ | Video/audio transcoding pipeline with queue management |
| Authentication | Keycloak | Self-hosted identity/auth provider |
| Search | Meilisearch | Fast self-hosted search over media library |
| Analytics | Umami | Privacy-friendly, self-hosted analytics |
| Uploads | tus | Resumable upload protocol, useful for large media files |
| iOS app | Swift / SwiftUI | Native client, full device API access |
| Android app | Kotlin / Jetpack Compose | Native client, full device API access |
| Desktop app | Tauri | macOS, Windows, Linux native wrapper |

## Guiding Principle

One tool per job ("jobs to be done" framing) — avoid stacking multiple tools that
solve the same problem. Compute (Hetzner) and storage (R2) are treated as separate,
swappable layers by design.
