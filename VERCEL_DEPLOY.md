# Vercel Deployment — Quickstart

This project is a **pnpm monorepo**. Vercel handles only the **frontend** (`artifacts/pest-control`). The backend must be deployed separately to **Railway** or **Render** (see `DEPLOY.md`).

---

## 1. Prerequisites

- Repo pushed to GitHub / GitLab / Bitbucket
- Backend already deployed on Railway/Render (see `DEPLOY.md` → step 1). You'll need its public URL.
- Clerk account with a Publishable Key

---

## 2. Import into Vercel

1. Go to https://vercel.com → **Add New… → Project**
2. Import the GitHub repo.
3. On the configuration screen:
   - **Framework Preset**: `Other` (Vercel auto-reads `/vercel.json` at repo root)
   - **Root Directory**: `./` — **leave as the repo root, NOT `artifacts/pest-control`** (pnpm workspaces need the full repo context)
   - **Build Command**: auto-filled from `vercel.json` → `pnpm --filter @workspace/pest-control run build`
   - **Output Directory**: auto-filled from `vercel.json` → `artifacts/pest-control/dist/public`
   - **Install Command**: auto-filled → `pnpm install --frozen-lockfile=false`
   - **Node Version**: `22.x` (Vercel picks this up from `engines.node` in root `package.json`)

## 3. Environment Variables

Under **Environment Variables**, add:

| Variable | Value | Notes |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_…` or `pk_live_…` | From Clerk dashboard → API Keys |
| `VITE_API_URL` | `https://your-backend.up.railway.app` | Public backend URL (no trailing slash, no `/api`) |
| `SITE_URL` | `https://your-app.vercel.app` | Used for sitemap.xml. Can be updated later to a custom domain. |
| `MONGODB_URI` *(optional)* | Your Atlas connection string | Only used by the prebuild sitemap script to enumerate service slugs. If unset, the sitemap will still generate but skip individual service pages. |

Apply all three environments: **Production**, **Preview**, **Development**.

## 4. Deploy

Click **Deploy**. First build takes ~2–3 min.

Once live:
- Copy the Vercel URL (e.g. `pest-control-xyz.vercel.app`).
- Go back to your backend host (Railway/Render) → set `CORS_ORIGINS=https://pest-control-xyz.vercel.app` → redeploy the backend.

## 5. Custom Domain

Vercel → Project → **Settings → Domains** → add your domain → follow the DNS instructions Vercel shows. SSL is automatic.

Once the domain is live, update:
- Vercel env var `SITE_URL` → your custom domain
- Backend env var `CORS_ORIGINS` → add your custom domain

## 6. Sanity Checks

```bash
# Frontend serving
curl -I https://your-app.vercel.app

# Frontend → Backend health
open https://your-app.vercel.app                       # loads the SPA
# In DevTools Network tab, XHR calls should go to https://your-backend.../api/*
```

If the site loads but you see CORS errors in DevTools, revisit `CORS_ORIGINS` on the backend host.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: `Cannot find pnpm` | Confirm Vercel Node version is 22+. Check `engines.node` in root `package.json`. |
| Build fails: `unsupported engine` | Enable "Ignore engines" is NOT needed — instead ensure Node 22.13+ is used. |
| Build fails: `minimumReleaseAge` errors | Some workspace package was published < 24h ago. Wait or add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml`. |
| CORS blocked at runtime | Set `CORS_ORIGINS` on the backend host to the exact Vercel URL (comma-separated for multiple). |
| Sitemap missing service pages | Set `MONGODB_URI` on Vercel (read-only user is safest). |
| 404 on nested routes (e.g. `/services/general-pest-control`) | Confirm `vercel.json` has the SPA rewrite (`/(.*) → /index.html`). It does by default. |

---

## Env Var Reference (Frontend / Vercel)

See `artifacts/pest-control/.env.example` for the canonical list.

## Env Var Reference (Backend / Railway or Render)

See `artifacts/api-server/.env.example` and the main `DEPLOY.md`.
