# react-error-boundary-patterns

> Production-grade React error boundary patterns for SaaS applications — with global catching, feature isolation, async error bridging, and pluggable error reporting.

[![npm version](https://img.shields.io/npm/v/react-crash-guard)](https://www.npmjs.com/package/react-crash-guard)
[![CI](https://github.com/mughalhere/react-error-boundary-patterns/actions/workflows/ci.yml/badge.svg)](https://github.com/mughalhere/react-error-boundary-patterns/actions)
[![Coverage](https://img.shields.io/badge/coverage-%3E80%25-brightgreen)](./packages/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./packages/core/tsconfig.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**[Live Demo](https://react-error-boundary-patterns.vercel.app)** · **[npm Package](https://www.npmjs.com/package/react-crash-guard)** · **[npm Profile](https://www.npmjs.com/~mughalhere)** · **[Author](https://mozia.dev)**

---

## The Problem

React's default error behavior crashes your entire application on a single render failure. In production SaaS apps, this means one broken widget takes down the whole page — a terrible user experience.

Most teams either:
- Skip error boundaries entirely (hoping for the best)
- Add a single top-level boundary with a generic "Something went wrong" message
- Have no visibility into what errors actually occurred in production

This repository demonstrates how to architect error handling the right way: **layered, isolated, observable, and recoverable**.

---

## Architecture

### The Boundary Hierarchy

The core pattern is a three-layer boundary system. Each layer serves a distinct purpose and catches a different class of failure.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Root                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              GlobalErrorBoundary                          │  │
│  │         (catches everything that escapes below)           │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐  │  │
│  │  │ RouteErrorBound │    │     RouteErrorBoundary      │  │  │
│  │  │    /dashboard   │    │         /settings           │  │  │
│  │  │                 │    │                             │  │  │
│  │  │ ┌─────────────┐ │    │  ┌──────────┐ ┌─────────┐  │  │  │
│  │  │ │FeatureBound │ │    │  │FeatureBnd│ │FeatBnd  │  │  │  │
│  │  │ │  <Chart />  │ │    │  │ <Form /> │ │<Table/> │  │  │  │
│  │  │ └─────────────┘ │    │  └──────────┘ └─────────┘  │  │  │
│  │  └─────────────────┘    └─────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Layer 1 — `GlobalErrorBoundary`**: The last line of defence. Catches anything that wasn't isolated below. Shows a full-page fallback with recovery options.

**Layer 2 — `RouteErrorBoundary`**: Per-route isolation. A crash in `/dashboard` doesn't affect `/settings`. The user can navigate away without a full reload.

**Layer 3 — `FeatureErrorBoundary`**: Finest-grained isolation. A broken chart or widget fails silently or shows an inline fallback — the rest of the page continues working.

---

### Error Flow & Reporting Pipeline

```
  React Component throws
          │
          ▼
  Nearest Error Boundary
  catches in componentDidCatch
          │
          ├──► errorClassifier(error)
          │         │
          │         └──► { type, recoverable, userMessage, retryable }
          │
          ├──► ErrorReporter.report(error, context)
          │         │
          │         ├──► SentryReporter  ──► Sentry.captureException()
          │         ├──► ConsoleReporter ──► console.error (dev)
          │         └──► CustomReporter  ──► your own pipeline
          │
          └──► Render fallback UI
                    │
                    └──► useErrorRecovery()
                              │
                              └──► retry() / reset() / maxRetries check
```

---

### Async Error Bridging

React error boundaries only catch **render-time** errors. This hook bridges async errors (fetch failures, setTimeout throws, promise rejections) into the nearest boundary:

```
  async function fetchData() {
    throw new Error('Network failure')    ← NOT caught by boundary natively
  }

  const throwError = useErrorHandler()   ← bridges async → boundary

  useEffect(() => {
    fetchData().catch(throwError)         ← NOW caught by nearest boundary
  }, [])
```

```
  Component           useErrorHandler        ErrorBoundary
      │                     │                     │
      │──── throwError ─────►                     │
      │     (async err)      │                     │
      │                      │──── setState ──────►│
      │                      │     triggers        │
      │                      │     re-render       │
      │                      │     with error ────►│ componentDidCatch
      │                      │                     │ → report → fallback
```

---

## Installation

```bash
npm install react-crash-guard
# or
pnpm add react-crash-guard
```

**Peer dependencies:** React 18+

---

## Quick Start

### 1. Wrap your app with `GlobalErrorBoundary`

```tsx
// src/main.tsx
import { GlobalErrorBoundary, SentryReporter } from 'react-crash-guard';

const reporter = new SentryReporter({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

root.render(
  <GlobalErrorBoundary
    reporter={reporter}
    fallback={(error, reset) => (
      <CrashPage error={error} onReset={reset} />
    )}
  >
    <App />
  </GlobalErrorBoundary>
);
```

### 2. Isolate routes with `RouteErrorBoundary`

```tsx
// src/router.tsx
import { RouteErrorBoundary } from 'react-crash-guard';

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <RouteErrorBoundary routeName="dashboard" reporter={reporter}>
            <DashboardPage />
          </RouteErrorBoundary>
        }
      />
      <Route
        path="/settings"
        element={
          <RouteErrorBoundary routeName="settings" reporter={reporter}>
            <SettingsPage />
          </RouteErrorBoundary>
        }
      />
    </Routes>
  );
}
```

### 3. Isolate risky features with `FeatureErrorBoundary`

```tsx
// Wrap any component that might fail independently
import { FeatureErrorBoundary } from 'react-crash-guard';

function Dashboard() {
  return (
    <div>
      <FeatureErrorBoundary featureName="revenue-chart" reporter={reporter}>
        <RevenueChart />           {/* crash here stays contained */}
      </FeatureErrorBoundary>

      <FeatureErrorBoundary featureName="activity-feed" silent>
        <ActivityFeed />           {/* silent mode — no UI fallback shown */}
      </FeatureErrorBoundary>
    </div>
  );
}
```

### 4. Handle async errors with `useErrorHandler`

```tsx
import { useErrorHandler } from 'react-crash-guard';

function CampaignList() {
  const throwError = useErrorHandler();

  useEffect(() => {
    fetchCampaigns()
      .then(setCampaigns)
      .catch(throwError); // bridges into nearest boundary
  }, []);

  return <>{/* render campaigns */}</>;
}
```

### 5. Build recovery UI with `useErrorRecovery`

```tsx
import { useErrorRecovery } from 'react-crash-guard';

function ErrorFallback({ error }: { error: Error }) {
  const { retry, retryCount, isRecovering } = useErrorRecovery({
    maxRetries: 3,
    retryDelay: 1000,
  });

  return (
    <div>
      <p>{error.message}</p>
      <p>Retry attempt: {retryCount} / 3</p>
      <button onClick={retry} disabled={isRecovering}>
        {isRecovering ? 'Retrying...' : 'Try again'}
      </button>
    </div>
  );
}
```

---

## Error Classification

The `errorClassifier` utility inspects errors and returns structured metadata for smarter fallback decisions:

```ts
import { classifyError } from 'react-crash-guard';

const result = classifyError(error);
// {
//   type: 'network' | 'chunk-load' | 'render' | 'permission' | 'unknown'
//   recoverable: true,
//   retryable: true,
//   userMessage: 'Connection issue. Please check your network and try again.'
// }
```

| Error Type    | Recoverable | Retryable | Example                                   |
|---------------|-------------|-----------|-------------------------------------------|
| `network`     | ✅          | ✅        | fetch() timeout, DNS failure              |
| `chunk-load`  | ✅          | ✅        | Lazy-loaded route fails after deploy      |
| `permission`  | ❌          | ❌        | Unauthorized access to resource           |
| `render`      | ✅          | ✅        | Component throws during render            |
| `unknown`     | ❌          | ❌        | Unclassified / unexpected error           |

---

## Error Reporters

Reporters are pluggable. Implement the `ErrorReporter` interface to integrate any observability tool:

```ts
interface ErrorReporter {
  report(error: Error, context: ErrorContext): void | Promise<void>;
}

interface ErrorContext {
  componentStack?: string;
  boundaryName?: string;
  routeName?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}
```

### Built-in: `SentryReporter`

```ts
import { SentryReporter } from 'react-crash-guard';

const reporter = new SentryReporter({
  dsn: 'https://your-dsn@sentry.io/project',
  environment: 'production',
});
```

### Built-in: `ConsoleReporter`

```ts
import { ConsoleReporter } from 'react-crash-guard';

// Useful for development and testing
const reporter = new ConsoleReporter();
```

### Custom Reporter Example

```ts
// Send errors to your own API
class DatadogReporter implements ErrorReporter {
  report(error: Error, context: ErrorContext) {
    datadogLogs.logger.error(error.message, { error, ...context });
  }
}
```

---

## API Reference

### `GlobalErrorBoundary`

| Prop          | Type                                              | Default     | Description                                      |
|---------------|---------------------------------------------------|-------------|--------------------------------------------------|
| `children`    | `ReactNode`                                       | required    | Application tree to wrap                         |
| `fallback`    | `ReactNode \| (error, reset) => ReactNode`        | built-in UI | Custom fallback UI                               |
| `reporter`    | `ErrorReporter`                                   | none        | Pluggable error reporter                         |
| `onError`     | `(error: Error, info: ErrorInfo) => void`         | none        | Additional error callback                        |
| `showDialog`  | `boolean`                                         | `false`     | Show user feedback dialog on error               |

### `RouteErrorBoundary`

| Prop          | Type                                              | Default     | Description                                      |
|---------------|---------------------------------------------------|-------------|--------------------------------------------------|
| `routeName`   | `string`                                          | required    | Route identifier (used in error context)         |
| `isolate`     | `boolean`                                         | `false`     | Prevent error from bubbling to global boundary   |
| + all GlobalErrorBoundary props                                                                              |

### `FeatureErrorBoundary`

| Prop          | Type                                              | Default     | Description                                      |
|---------------|---------------------------------------------------|-------------|--------------------------------------------------|
| `featureName` | `string`                                          | required    | Feature identifier (used in error context)       |
| `silent`      | `boolean`                                         | `false`     | Suppress UI fallback, report only                |
| + all GlobalErrorBoundary props                                                                              |

### `useErrorHandler()`

Returns `(error: Error) => void`. Call the returned function from async code to bridge errors into the nearest boundary.

### `useErrorRecovery(options?)`

| Option        | Type     | Default | Description                     |
|---------------|----------|---------|---------------------------------|
| `maxRetries`  | `number` | `3`     | Maximum retry attempts          |
| `retryDelay`  | `number` | `1000`  | Delay between retries (ms)      |

Returns `{ retry, retryCount, isRecovering }`.

---

## Examples

Each example is a standalone Vite app.

```bash
# Clone the repo
git clone https://github.com/mughalhere/react-error-boundary-patterns.git
cd react-error-boundary-patterns
pnpm install

# Run a specific example
cd examples/01-basic-boundary && pnpm dev
cd examples/02-global-app-boundary && pnpm dev
cd examples/03-sentry-integration && pnpm dev

# Run the full interactive demo
cd demo && pnpm dev
```

| Example | What it demonstrates |
|---|---|
| [`01-basic-boundary`](./examples/01-basic-boundary) | Single component isolation, custom fallback, reset |
| [`02-global-app-boundary`](./examples/02-global-app-boundary) | Three-layer hierarchy, route isolation, error propagation |
| [`03-sentry-integration`](./examples/03-sentry-integration) | SentryReporter, async error bridging, production setup |

---

## Real-World Context

These patterns are derived from production work across multiple SaaS applications:

- **Global error boundary** architecture deployed at [Instantly.ai](https://instantly.ai), reducing support ticket volume by 47% and achieving 99.8% error capture rate across all client sessions
- **Feature-level isolation** patterns used at [Convert.com](https://convert.com) to prevent experimentation widget failures from affecting the broader application
- **Async error bridging** essential for high-volume data operations where fetch failures must surface correctly through the boundary hierarchy

---

## Contributing

Contributions are welcome. Please open an issue before submitting a PR for significant changes.

```bash
pnpm test          # run tests
pnpm typecheck     # tsc --noEmit
pnpm build         # build core package
```

---

## License

MIT © [Muhammad Zia](https://mozia.dev)