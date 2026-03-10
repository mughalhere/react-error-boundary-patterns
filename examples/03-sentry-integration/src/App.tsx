import { useState } from "react";
import {
  GlobalErrorBoundary,
  SentryReporter,
  ErrorHandlerProvider,
  useErrorHandler,
} from "react-crash-guard";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const reporter = sentryDsn
  ? new SentryReporter({ dsn: sentryDsn, environment: "demo" })
  : undefined;

function TriggerPanel() {
  const throwError = useErrorHandler();
  const [renderError, setRenderError] = useState(false);

  if (renderError) throw new Error("Intentional render error for Sentry demo.");

  const triggerAsync = () => {
    setTimeout(() => {
      throwError(new Error("Async error (useErrorHandler) for Sentry demo."));
    }, 100);
  };

  return (
    <div>
      <button type="button" onClick={() => setRenderError(true)}>
        Trigger render error
      </button>
      <button type="button" onClick={triggerAsync}>
        Trigger async error
      </button>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary
      reporter={reporter}
      fallback={(error, reset) => (
        <div style={{ padding: "2rem", border: "1px solid #c00" }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <p>
            {reporter
              ? "Error was reported to Sentry (if DSN is set)."
              : "No Sentry DSN — error only shown here."}
          </p>
          <button type="button" onClick={reset}>
            Retry
          </button>
        </div>
      )}
    >
      <ErrorHandlerProvider>
        <h1>Example 03 — Sentry Integration</h1>
        <TriggerPanel />
      </ErrorHandlerProvider>
    </GlobalErrorBoundary>
  );
}

export { App };
