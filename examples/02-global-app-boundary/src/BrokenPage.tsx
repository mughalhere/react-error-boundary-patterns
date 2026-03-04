import { useState } from "react";

function ThrowsWhenTriggered({ trigger }: { trigger: boolean }) {
  if (trigger) throw new Error("Route-level error (Broken route)");
  return <p>Click the button to trigger an error on this route.</p>;
}

export function BrokenPage() {
  const [trigger, setTrigger] = useState(false);

  return (
    <div>
      <h2>Broken Route</h2>
      <button type="button" onClick={() => setTrigger(true)}>
        Trigger Error
      </button>
      <ThrowsWhenTriggered trigger={trigger} />
    </div>
  );
}
