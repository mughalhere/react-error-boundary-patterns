# Example 03 — Sentry Integration

`GlobalErrorBoundary` with `SentryReporter` and `useErrorHandler` for async errors. Demonstrates:

- Production-grade reporting with optional Sentry (graceful when `VITE_SENTRY_DSN` is unset)
- Bridging async/fetch errors into the boundary via `useErrorHandler`

## Run

```bash
pnpm install
pnpm dev
```

Set `VITE_SENTRY_DSN` in `.env` to send errors to Sentry; otherwise the reporter no-ops. Click **Trigger render error** or **Trigger async error** to see the boundary and (if DSN set) Sentry reports.
