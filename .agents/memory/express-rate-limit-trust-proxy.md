---
name: express-rate-limit-trust-proxy
description: express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR when Express doesn't trust the proxy, common on Replit where requests arrive via a proxy with X-Forwarded-For set.
---

Any Express app behind Replit's proxy (i.e. basically all of them) that uses `express-rate-limit` must call `app.set("trust proxy", 1)` before mounting the limiter.

**Why:** Replit's preview/proxy layer sets `X-Forwarded-For`. Without `trust proxy` enabled, express-rate-limit refuses to use it for keying and throws `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` on every request (visible as a stack trace in workflow logs, though requests still technically succeed).

**How to apply:** Whenever adding `express-rate-limit` (or any other middleware that reads the client IP) to an Express app in this environment, set `app.set("trust proxy", 1)` immediately after creating the `app` instance.
