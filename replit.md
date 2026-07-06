# Utkal Pest Control

A pest-control booking website: customers browse services, request quotes/book appointments, and admins/technicians manage bookings via role-based dashboards.

## Run & Operate

- `pnpm --filter @workspace/pest-control run dev` — run the frontend (Vite, port 19006)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/api-server run seed` — seed MongoDB with sample services/users/bookings
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `MONGODB_URI`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Optional env: `CLERK_WEBHOOK_SECRET` (Clerk user-sync webhook), `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`CONTACT_NOTIFICATION_EMAIL` (contact form email notifications), `VITE_BUSINESS_NAME`/`VITE_TAGLINE`/`VITE_SERVICE_AREAS` (branding)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/pest-control`), wouter routing, shadcn/ui, Tailwind CSS
- API: Express 5 (`artifacts/api-server`), plain hand-written routes (no OpenAPI/Orval codegen — see below)
- DB: MongoDB + Mongoose (not the workspace's default Postgres/Drizzle stack)
- Auth: Clerk (`@clerk/clerk-react` on frontend, `@clerk/backend` for server-side token verification, svix-verified webhook to sync users)
- Build: esbuild (CJS bundle) for the API, Vite for the frontend

## Where things live

- `artifacts/pest-control/src/pages/*` — routed pages (home, about, contact, services, service-detail, quote, dashboard + role variants)
- `artifacts/pest-control/src/config/business.ts` — env-driven business name/tagline/service areas
- `artifacts/api-server/src/models/index.ts` — Mongoose schemas (User, Service, Booking, Technician, Review, Payment, ContactMessage)
- `artifacts/api-server/src/routes/*` — services, bookings, contact, me, webhooks (Clerk)
- `artifacts/api-server/src/lib/mongo.ts`, `src/lib/clerkAuth.ts`, `src/lib/mailer.ts` — Mongo connection, Clerk token verification, optional SMTP notifications
- `artifacts/api-server/src/scripts/seed.ts` — sample data seed script

## Architecture decisions

- This project was migrated from a Next.js 14 App Router app (originally MongoDB/Mongoose/Clerk/Tailwind). Since Next.js isn't a supported artifact type, only the routing/rendering layer was converted to Vite+React+Express — MongoDB, Mongoose, and Clerk were kept as-is rather than migrated to Postgres/Drizzle.
- Because the DB is Mongo (not Postgres), the API skips the workspace's default OpenAPI/Orval codegen pipeline (`@workspace/api-zod`/`@workspace/api-client-react`) and uses plain Express routes + hand-written Zod validation, with a small `apiFetch` helper on the frontend instead of generated React Query hooks.
- Clerk publishable key is injected into the Vite build via `define` in `vite.config.ts` (sourced from the `CLERK_PUBLISHABLE_KEY` secret) rather than requiring a duplicate `VITE_`-prefixed secret.

## Product

- Public pages: premium home (stats, service grid, how-it-works, live testimonials, FAQ), about, services list/detail, contact form.
- Customers sign in via Clerk and submit detailed booking requests ("Get a Quote": service, address, property type, area size, date/time, notes, emergency flag).
- Booking lifecycle: pending → confirmed → technician-assigned → en-route → in-progress → completed/cancelled, with a full status-history timeline, reschedule/cancel, and in-app + email notifications at each transition.
- Customer dashboard: upcoming/history tabs, booking detail page (timeline, reschedule/cancel, Razorpay payment button, review form after completion), printable invoice page, profile page (edit phone).
- Admin dashboard: analytics cards (bookings/revenue/customers/technicians/avg rating), tabbed bookings (status + technician-assignment dropdowns), customers, technicians, reviews.
- Technician portal: assigned jobs list, start job, complete job (before/after photo URLs, notes, typed customer signature) — completing a job auto-generates an invoice.
- Payments: Razorpay checkout wired end-to-end in booking-detail; gracefully reports "not configured" (`/api/payments/config` → `configured:false`) until `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` secrets are set.
- Notifications: in-app bell (`/api/notifications`) + email (via optional SMTP config) on booking create/status-change/reschedule/cancel.
- Reviews: customers rate/comment after a completed booking; surfaced on admin dashboard and homepage testimonials.
- Contact form messages are stored in Mongo and optionally emailed via SMTP if configured.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

- Keep MongoDB + Mongoose + Clerk as the stack (no Postgres/Drizzle/JWT re-platform) even though the workspace default is Postgres — this was an explicit, confirmed decision.

## Gotchas

- `CLERK_WEBHOOK_SECRET` is not yet configured; the `/api/webhooks/clerk` route will reject events with a 500 until it's set.
- `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are not yet configured; payment endpoints return `501`/`configured:false` until added — request via environment-secrets skill when the user is ready to accept real payments.
- Invoices are printable HTML (`window.print()`) rather than generated PDFs — avoids an extra PDF dependency while still satisfying "download invoice".
- `pnpm --filter <artifact> run build` run standalone (outside its workflow) will fail with "PORT/BASE_PATH environment variable is required" — those are injected by the workflow at runtime; use `pnpm run typecheck` for standalone verification instead.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
