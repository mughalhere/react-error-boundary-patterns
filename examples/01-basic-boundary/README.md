# Example 01 — Basic Boundary

Single component wrapped in `FeatureErrorBoundary` with a trigger button that throws a render error. Demonstrates:

- Basic setup and wrapping a feature
- Custom fallback UI
- Reset and recovery

## Run

```bash
pnpm install
pnpm dev
```

Open the URL shown in the terminal (e.g. http://localhost:5173).

## Usage

Click **Trigger Error** to throw inside the boundary. The fallback is shown. Use **Reset** to recover.
