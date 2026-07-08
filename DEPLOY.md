# Deployment Guide

This monorepo ships as two independent services:

| Service       | Path                        | Host suggested        |
| ------------- | --------------------------- | --------------------- |
| Frontend (SPA)| `artifacts/pest-control`    | **Vercel**            |
| Backend (API) | `artifacts/api-server`      | **Railway** or **Render** |

The frontend is a Vite/React SPA. The backend is an Express server that connects to MongoDB Atlas, Clerk, Razorpay, and SMTP.

---

## 1. Deploy the backend first (Railway or Render)

You need the backend URL before you can configure the frontend.

### Option A — Railway

1. Push this repo to GitHub.
2. Create a new project on [Railway](https://railway.app/) → **Deploy from GitHub repo**.
3. Railway auto-detects `railway.json` at repo root. Confirm:
   - Build command: `corepack enable && pnpm install --frozen-lockfile=false && pnpm --filter @workspace/api-server run build`
   - Start command: `pnpm --filter @workspace/api-server run start`
   - Healthcheck: `/api/healthz`
4. Under **Variables**, paste everything from `artifacts/api-server/.env.example` with real values. Required:
   - `PORT` — leave unset (Railway injects one automatically) OR set `8001`
   - `MONGODB_URI`
   - `CLERK_SECRET_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `CORS_ORIGINS` — set to your Vercel URL(s), comma-separated (you'll add this after deploying the frontend)
5. Deploy. Copy the generated URL, e.g. `https://pest-control-api.up.railway.app`.

### Option B — Render

1. Push repo to GitHub.
2. On [Render](https://render.com), **New → Blueprint** → connect the repo.
3. Render reads `render.yaml` at repo root and provisions a Web Service.
4. Fill in the same environment variables listed above.
5. Deploy. Note the URL, e.g. `https://pest-control-api.onrender.com`.

Sanity check: `curl https://<your-backend>/api/healthz` should return `{"status":"ok"}`.

---

## 2. Deploy the frontend (Vercel)

1. On [Vercel](https://vercel.com), **Add New Project** → import the same GitHub repo.
2. Framework Preset: **Other** (Vercel will read `vercel.json` at repo root).
3. **Root Directory**: leave as `./` (the repo root — required for pnpm workspaces).
4. Under **Environment Variables**, set:
   - `VITE_CLERK_PUBLISHABLE_KEY` — from https://dashboard.clerk.com
   - `VITE_API_URL` — the backend URL from step 1 (no trailing slash)
   - *(optional)* `VITE_BUSINESS_NAME`, `VITE_TAGLINE`, `VITE_SERVICE_AREAS`
5. Deploy. Copy the generated URL, e.g. `https://pest-control-xyz.vercel.app`.

---

## 3. Wire the two together

Go back to Railway/Render and set:

```
CORS_ORIGINS=https://pest-control-xyz.vercel.app
```

(Add multiple origins comma-separated if you also use a custom domain.)

Redeploy the backend. Done.

---

## Local development

```bash
corepack enable
pnpm install

# Backend
cp artifacts/api-server/.env.example artifacts/api-server/.env
# fill in values, then:
pnpm --filter @workspace/api-server run dev

# Frontend (in another terminal)
cp artifacts/pest-control/.env.example artifacts/pest-control/.env
# fill in values, then:
pnpm --filter @workspace/pest-control run dev
```

Requires Node.js **v22.13+** and pnpm **v11+**.

---

## Required external accounts

| Service        | What you need                             | Where |
| -------------- | ----------------------------------------- | ----- |
| MongoDB Atlas  | Cluster + connection string               | https://cloud.mongodb.com |
| Clerk          | Publishable + Secret keys                 | https://dashboard.clerk.com |
| Razorpay       | Key ID + Key Secret                       | https://dashboard.razorpay.com |
| SMTP provider  | Host / port / user / pass                 | Gmail, SendGrid, Resend, etc. |
