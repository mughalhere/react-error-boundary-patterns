# Example 02 — Global App Boundary

Full app wrapped in `GlobalErrorBoundary` with multiple routes, each wrapped in `RouteErrorBoundary`. Demonstrates:

- Global vs route-level error isolation
- Error propagation hierarchy (route boundary catches first; if not isolated, can bubble to global)

## Run

```bash
pnpm install
pnpm dev
```

Navigate between Home and Broken route. Use **Trigger Error** on the Broken route to see the route fallback. The global boundary catches any error that escapes route boundaries.
