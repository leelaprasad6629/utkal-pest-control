# PRD — Pest Control Booking Platform

## Original Problem
Fix Sitemap tab in admin dashboard (was showing URLs instead of geographical map), then make the monorepo deployable to Vercel (frontend) + Railway/Render (backend).

## Architecture
Monorepo (pnpm workspaces):
- `artifacts/pest-control` — Vite + React 19 + Wouter + Clerk (frontend)
- `artifacts/api-server` — Express 5 + Mongoose + Clerk backend + Razorpay + SMTP
- `lib/*` — shared workspace packages (`api-zod`, `api-client-react`, `db`)

## Completed (Jan 2026)
- Fixed `dashboard-admin.tsx` line 1214: `<SitemapTab />` → `<ServiceMapTab />` so the Leaflet-based booking map renders in the admin Sitemap tab.
- Made frontend API base URL configurable via `VITE_API_URL` for cross-origin deploy.
- Made `PORT` / `BASE_PATH` optional in `vite.config.ts` (Vercel builds without them).
- Made backend CORS configurable via `CORS_ORIGINS`.
- Removed bash-specific `export` from backend `dev` script.
- Made sitemap prebuild script (`scripts/generate-sitemap.mjs`) work with `SITE_URL` / `VERCEL_URL` instead of Replit-only vars.
- Added deployment configs: `/app/vercel.json`, `/app/render.yaml`, `/app/railway.json`.
- Added `.env.example` files for both services.
- Added `.nvmrc` + `engines` + `packageManager` fields to root `package.json`.
- Added `/app/DEPLOY.md` with step-by-step deployment instructions.

## Deployment Target
- Frontend → Vercel (root `./`, uses `vercel.json`, builds pest-control workspace)
- Backend → Railway or Render (uses `railway.json` or `render.yaml`)

## Required External Services
- MongoDB Atlas (`MONGODB_URI`)
- Clerk (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optionally `CLERK_WEBHOOK_SECRET`)
- Razorpay (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- SMTP provider (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

## Backlog / Next Steps
- P1: Consider restricting `helmet` CSP for production hardening.
- P2: Remove unused Drizzle/PostgreSQL setup in `lib/db` if not needed.
- P2: Add CI (GitHub Actions) that runs `pnpm typecheck` before deploying.
- P2: Add Dockerfile for VPS/K8s deploy as a third option.
