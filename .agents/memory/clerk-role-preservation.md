---
name: Clerk role preservation on email-link
description: How /me avoids overwriting admin-assigned roles when a technician first signs in via Clerk
---

# Clerk role preservation on email-link

**The rule:** `fetchClerkRole` must return `null` (not `"customer"`) when Clerk publicMetadata has no explicit `role` field. Email-linking and role-sync both use `clerkRole` directly (not `clerkRole ?? "customer"`), so DB roles set by admin are never overwritten by Clerk's default.

**Why:** When admin creates a technician pre-signup, the local User gets `role: "technician"` with no `clerkId`. On first Clerk sign-in, `/me` links by email — but the old code passed `role: clerkRole ?? "customer"` into the `$set`, downgrading the role to `customer` because Clerk metadata had no explicit role. This broke `requireTechnician` with a 403.

**How to apply:**
- `fetchClerkRole` in `me.ts`: guard with `if (!raw) return null` before `normalizeRole(raw)`.
- Email-linking `$set`: `...(clerkRole ? { role: clerkRole } : {})` — omit role from `$set` entirely when Clerk has no explicit role.
- Same pattern for the role-sync `else if` (already uses `clerkRole &&` guard so it's fine once `fetchClerkRole` returns null correctly).

**Also fixed:** Technician emails must be stored lowercase (`email.toLowerCase().trim()`) in both POST and PATCH `/admin/technicians` so they match `/me`'s `normalizedEmail` lookup and avoid split-identity duplicate users.
