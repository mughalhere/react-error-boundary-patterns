import {
  FeatureErrorBoundary,
  ErrorHandlerProvider,
  useErrorHandler,
} from "@mozia/react-error-boundaries";
import { useDemoReporter } from "../context/DemoReporterContext";

function AsyncTrigger() {
  const throwError = useErrorHandler();

  const trigger = () => {
    setTimeout(() => {
      throwError(new Error("Async error: simulated failure after delay."));
    }, 100);
  };

  return (
    <div>
      <button
        type="button"
        onClick={trigger}
        className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium"
      >
        Trigger Error
      </button>
      <p className="text-zinc-400 mt-2 text-sm">Throws via useErrorHandler after a short delay.</p>
    </div>
  );
}

export function AsyncError() {
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <h3 className="font-semibold text-zinc-200 mb-2">Async Error</h3>
      <FeatureErrorBoundary
        featureName="AsyncErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Async error caught (bridged to boundary via useErrorHandler).
          </div>
        }
      >
        <ErrorHandlerProvider>
          <AsyncTrigger />
        </ErrorHandlerProvider>
      </FeatureErrorBoundary>
    </div>
  );
}
