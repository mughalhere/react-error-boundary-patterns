import {
  FeatureErrorBoundary,
  ErrorHandlerProvider,
  useErrorHandler,
} from "react-crash-guard";
import { useDemoReporter } from "../context/DemoReporterContext";

function ChunkTrigger() {
  const throwError = useErrorHandler();

  const trigger = () => {
    throwError(new Error("Loading chunk 42 failed."));
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
      <p className="text-zinc-400 mt-2 text-sm">Simulates a chunk load failure (classified as chunk-load).</p>
    </div>
  );
}

export function ChunkLoadError() {
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <h3 className="font-semibold text-zinc-200 mb-2">Chunk Load Error</h3>
      <FeatureErrorBoundary
        featureName="ChunkLoadErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Chunk load error. Refresh the page to get the latest code.
          </div>
        }
      >
        <ErrorHandlerProvider>
          <ChunkTrigger />
        </ErrorHandlerProvider>
      </FeatureErrorBoundary>
    </div>
  );
}
