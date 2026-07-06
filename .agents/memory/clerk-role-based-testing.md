---
name: clerk-role-based-testing
description: How to e2e-test role-gated dashboards (admin/technician/customer) when the app lazily creates a local DB user record on first Clerk sign-in.
---

When an app authenticates via Clerk but keeps its own `users` table/collection (synced lazily on first API call, e.g. via a `findOrCreateLocalUser` helper), a freshly created test user via programmatic Clerk sign-in always starts with the default role (usually "customer").

**Why:** Role-gated UI (e.g. admin/technician dashboards) reads the role from the local DB record keyed by `clerkId`, not from Clerk itself. There's no signup flow that lets a test user pick a role.

**How to apply:** In e2e test plans for multi-role apps, after Clerk sign-in, first hit a route that triggers local-user creation (e.g. navigate to a profile/dashboard page or call GET /me), then use a `[DB]` step to patch that user's role field to admin/technician before reloading the dashboard route.
