import { useState } from "react";
import { FeatureErrorBoundary } from "@mozia/react-error-boundaries";

function BrokenWidget({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Intentional render error for demo.");
  return <p>This widget is OK.</p>;
}

function App() {
  const [trigger, setTrigger] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setTrigger(false);
    setResetKey((k) => k + 1);
  };

  return (
    <div>
      <h1>Example 01 — Basic Boundary</h1>
      <FeatureErrorBoundary
        key={resetKey}
        featureName="DemoWidget"
        fallback={
          <div style={{ padding: "1rem", border: "1px solid #c00", color: "#c00" }}>
            <p>This feature encountered an error.</p>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        }
      >
        <div>
          <button type="button" onClick={() => setTrigger(true)}>
            Trigger Error
          </button>
          <BrokenWidget shouldThrow={trigger} />
        </div>
      </FeatureErrorBoundary>
    </div>
  );
}

export { App };
