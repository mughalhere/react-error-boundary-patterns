# Architecture

## Overview

`@mozia/react-error-boundaries` provides a layered error boundary system for React 18+ applications:

1. **GlobalErrorBoundary** — Root-level catch for the entire app. Supports pluggable reporters (e.g. Sentry), function fallbacks with `(error, reset)`, and retry limits to avoid infinite loops.

2. **RouteErrorBoundary** — Wraps individual routes (e.g. React Router v6). Adds `routeName` to reporting context. When `isolate` is true, the error is contained to that route (conceptually; React still catches at the nearest boundary).

3. **FeatureErrorBoundary** — Lightweight isolation for features/widgets. Optional `silent` mode reports without showing UI.

4. **AsyncErrorBoundary** — Thin wrapper around FeatureErrorBoundary for async sections. Use with `useErrorHandler` to bridge promise/async errors into the boundary.

## Error handling flow

- **Render errors**: Thrown during render or lifecycle — caught by the nearest boundary’s `componentDidCatch`.
- **Async errors**: Use `useErrorHandler()` inside `ErrorHandlerProvider`. Calling the returned function sets state that causes a throw on the next render, so the nearest boundary catches it.

## Reporting

- **ErrorReporter** interface: `report(error: Error, context: ErrorContext): void | Promise<void>`.
- **ConsoleReporter**: Logs to `console.error` (dev/demo).
- **SentryReporter**: Forwards to Sentry when available (optional DSN / `getCaptureException`).

## Recovery

- Boundaries that support reset expose it in the fallback via the function signature `(error, reset) => ReactNode` or via **useErrorRecovery** inside the fallback (GlobalErrorBoundary and RouteErrorBoundary provide **ErrorRecoveryContext**).
- Retry limits (e.g. max 3) prevent infinite re-render loops.

## Package layout

- `boundaries/` — Class components (required for error boundaries) and wrappers.
- `hooks/` — useErrorHandler, useErrorRecovery.
- `context/` — ErrorHandlerProvider, ErrorRecoveryContext.
- `reporters/` — ErrorReporter implementation and types.
- `utils/` — errorClassifier, errorSerializer.
