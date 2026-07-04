---
name: Next.js -> Vite+Mongo migration
description: How to port a Next.js/Mongoose/Clerk app into the pnpm-workspace stack when Postgres/Drizzle isn't the DB.
---

When migrating an imported Next.js app that uses MongoDB/Mongoose (not Postgres), do not force it onto the `@workspace/db` Drizzle + OpenAPI/Orval codegen pipeline. Instead:

- Add `mongoose` directly as a dependency of `artifacts/api-server` and write plain Express routes + Zod validation by hand (no codegen). The OpenAPI/Orval pipeline assumes Drizzle/Postgres and entity-shaped schemas; forcing Mongo through it adds churn with no benefit.
- Frontend still uses plain `fetch` (a small `apiFetch` helper) instead of the generated `@workspace/api-client-react` hooks, since there's no OpenAPI spec driving this API.

**Why:** the workspace's codegen conventions (`lib/api-spec/openapi.yaml` -> Zod + React Query hooks) are tightly coupled to Drizzle/Postgres; a Mongo-backed API is a different shape of contract and doesn't benefit from that machinery.

**Clerk key on Vite frontend:** Vite only exposes `import.meta.env.VITE_*` vars that are present as `VITE_`-prefixed env vars at dev/build time. If a Clerk publishable key is stored as a plain (non-`VITE_`) secret (e.g. `CLERK_PUBLISHABLE_KEY`), inject it via `vite.config.ts`'s `define` block: `define: { "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(process.env.CLERK_PUBLISHABLE_KEY ?? "") }`. This avoids needing a duplicate `VITE_`-prefixed secret.

**Mongoose + ESM ambiguity:** `import { model, models } from "mongoose"` fails at runtime under Node ESM ("does not provide an export named 'models'"). Use `import mongoose from "mongoose"; const { models, model } = mongoose;` instead.
