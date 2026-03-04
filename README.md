# react-error-boundary-patterns

Production-grade React error boundary patterns for SaaS applications. A portfolio and reference implementation by **Muhammad Zia**.

## Package

**`@mozia/react-error-boundaries`** — npm package in `packages/core`.

- **Boundaries:** `GlobalErrorBoundary`, `RouteErrorBoundary`, `FeatureErrorBoundary`, `AsyncErrorBoundary`
- **Hooks:** `useErrorHandler`, `useErrorRecovery`
- **Reporters:** `ErrorReporter` interface, `ConsoleReporter`, `SentryReporter`
- **Utils:** `classifyError`, `serializeError`

See [packages/core](packages/core) and [docs/architecture.md](docs/architecture.md) for API and architecture.

## Repo structure

- **packages/core** — publishable npm package
- **examples/** — standalone Vite apps: `01-basic-boundary`, `02-global-app-boundary`, `03-sentry-integration`
- **demo/** — interactive demo with four error scenarios (Render, Async, Network, Chunk Load)
- **docs/** — architecture and reference

## Commands

```bash
pnpm install
pnpm build          # build core package
pnpm typecheck      # type-check all workspaces
pnpm test           # run tests (core)
pnpm dev            # run demo app
pnpm dev:example-01 # run example 01
pnpm dev:example-02 # run example 02
pnpm dev:example-03 # run example 03
```

## CI/CD

- **CI** (`.github/workflows/ci.yml`): on push/PR — install, typecheck, test, build core.
- **Publish** (`.github/workflows/publish.yml`): on tag `v*.*.*` — build and publish to npm, create GitHub Release.

## License

MIT © Muhammad Zia
