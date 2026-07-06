---
name: Artifact workflow PORT injection
description: configureWorkflow does not inject artifact env vars (PORT, BASE_PATH); they must be prefixed in the command string.
---

## Rule

When using `configureWorkflow` for an artifact service (because managed workflows weren't auto-registered), the PORT and BASE_PATH env vars are NOT automatically injected — they must be included inline in the command string.

**Why:** The managed artifact workflow system injects `[services.env]` values from `artifact.toml` automatically. A manually configured workflow has no access to those values, so the process sees an empty PORT and throws.

**How to apply:**

```javascript
await configureWorkflow({
  name: "artifacts/pest-control: web",
  command: "PORT=19006 BASE_PATH=/ pnpm --filter @workspace/pest-control run dev",
  waitForPort: 19006,
  outputType: "webview",
  autoStart: true
});

await configureWorkflow({
  name: "artifacts/api-server: API Server",
  command: "PORT=8080 pnpm --filter @workspace/api-server run dev",
  waitForPort: 8080,
  outputType: "console",
  autoStart: true
});
```

The correct port values come from `artifact.toml` → `[services.env]` or from the `ports` map returned by `createArtifact()`.
