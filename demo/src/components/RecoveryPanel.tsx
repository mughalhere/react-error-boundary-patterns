interface RecoveryPanelProps {
  reset: () => void;
}

export function RecoveryPanel({ reset }: RecoveryPanelProps) {
  return (
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
      >
        Retry
      </button>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded border border-zinc-600 hover:bg-zinc-700"
      >
        Reload page
      </button>
    </div>
  );
}
