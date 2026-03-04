interface ErrorDisplayProps {
  error: Error;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="max-w-lg rounded-lg border border-red-500/50 bg-zinc-800/80 p-6">
      <h2 className="text-red-400 font-semibold mb-2">Error caught</h2>
      <p className="text-zinc-300 font-mono text-sm break-words">{error.message}</p>
      {error.stack && (
        <pre className="mt-3 text-xs text-zinc-500 overflow-auto max-h-40 whitespace-pre-wrap">
          {error.stack}
        </pre>
      )}
    </div>
  );
}
