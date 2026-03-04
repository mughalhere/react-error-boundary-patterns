import { useState } from "react";
import { FeatureErrorBoundary } from "@mozia/react-error-boundaries";
import { useDemoReporter } from "../context/DemoReporterContext";

function ThrowsWhenTriggered({ trigger }: { trigger: boolean }) {
  if (trigger) throw new Error("Render error: intentional throw in component tree.");
  return <p className="text-zinc-400">Click the button to trigger a render error.</p>;
}

export function RenderError() {
  const [trigger, setTrigger] = useState(false);
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <h3 className="font-semibold text-zinc-200 mb-2">Render Error</h3>
      <FeatureErrorBoundary
        featureName="RenderErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Render error caught by boundary.
          </div>
        }
      >
        <div>
          <button
            type="button"
            onClick={() => setTrigger(true)}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium"
          >
            Trigger Error
          </button>
          <div className="mt-2">
            <ThrowsWhenTriggered trigger={trigger} />
          </div>
        </div>
      </FeatureErrorBoundary>
    </div>
  );
}
