# PRD — Pest Control Booking Platform

## Original Problem
1. Fix Sitemap tab in admin dashboard (was showing URLs instead of geographical map).
2. Make monorepo deployable — user chose Vercel (frontend) + Railway/Render (backend).

## Architecture
Monorepo (pnpm workspaces):
- `artifacts/pest-control` — Vite + React 19 + Wouter + Clerk (frontend)
- `artifacts/api-server` — Express 5 + Mongoose + Clerk + Razorpay + SMTP (backend)
- `lib/*` — shared workspace packages

## Completed (Jan 2026)
- **Bug fix**: `dashboard-admin.tsx` line 1214: `<SitemapTab />` → `<ServiceMapTab />` (Leaflet map now renders in admin Sitemap tab).
- **Frontend deploy prep**: `VITE_API_URL` cross-origin support; PORT/BASE_PATH optional in `vite.config.ts`; sitemap script works with SITE_URL/VERCEL_URL.
- **Backend deploy prep**: `CORS_ORIGINS` env-driven; removed bash-only `export` in dev script.
- **Config files**: `/app/vercel.json`, `/app/render.yaml`, `/app/railway.json`, `.env.example` × 2, `.nvmrc`, `engines`/`packageManager` in root `package.json`, `allowBuilds` fixed in `pnpm-workspace.yaml`.
- **Docs**: `/app/DEPLOY.md` (full guide) + `/app/VERCEL_DEPLOY.md` (Vercel quickstart).
- **Data seed**: `/app/artifacts/api-server/scripts/seed-services.mjs` — 7 services inserted into MongoDB Atlas.

## Live Preview
https://9aa7b735-07bd-44e4-adb1-033e5ed9d41a.preview.emergentagent.com/
- Frontend (Vite build) on port 3000
- Backend (Express) on port 8001, `/api/healthz` OK
- MongoDB Atlas connected, Clerk auth active, Razorpay test keys configured

## Deployment Path (Chosen: Option A — Vercel + Railway/Render)
1. Backend → Railway or Render (uses `railway.json` / `render.yaml`)
2. Frontend → Vercel (uses `vercel.json`, root dir `./`)
3. Wire `CORS_ORIGINS` on backend to the Vercel URL after both are deployed.

## Required External Services
- MongoDB Atlas (`MONGODB_URI`) ✓ provided
- Clerk publishable + secret keys ✓ provided
- Razorpay test key + secret ✓ provided
- SMTP (`SMTP_*`) — optional, not yet provided

## Backlog / Next Steps
- P1: SMTP credentials for contact-form emails
- P1: Configure Clerk webhook (`/api/webhooks/clerk`) for real-time role sync
- P2: Add first admin user (Clerk dashboard → user → publicMetadata `{"role":"admin"}`)
- P2: CI (GitHub Actions) that runs `pnpm typecheck` before deploy
- P2: Add Dockerfile for VPS deploy as alternate path
