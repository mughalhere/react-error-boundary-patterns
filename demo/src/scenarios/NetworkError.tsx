import {
  FeatureErrorBoundary,
  ErrorHandlerProvider,
  useErrorHandler,
} from "@mozia/react-error-boundaries";
import { useDemoReporter } from "../context/DemoReporterContext";

function NetworkTrigger() {
  const throwError = useErrorHandler();

  const trigger = () => {
    throwError(new Error("Network request failed."));
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
      <p className="text-zinc-400 mt-2 text-sm">Simulates a network error (classified as network).</p>
    </div>
  );
}

export function NetworkError() {
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <h3 className="font-semibold text-zinc-200 mb-2">Network Error</h3>
      <FeatureErrorBoundary
        featureName="NetworkErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Network error caught. Check your connection and try again.
          </div>
        }
      >
        <ErrorHandlerProvider>
          <NetworkTrigger />
        </ErrorHandlerProvider>
      </FeatureErrorBoundary>
    </div>
  );
}
