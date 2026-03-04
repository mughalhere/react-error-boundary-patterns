import { useCallback, useMemo, useState } from "react";
import {
  GlobalErrorBoundary,
  ConsoleReporter,
  ErrorHandlerProvider,
  classifyError,
  serializeError,
} from "@mozia/react-error-boundaries";
import type { ErrorContext } from "@mozia/react-error-boundaries";
import { DemoReporterProvider } from "./context/DemoReporterContext";
import { Layout } from "./components/Layout";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { RecoveryPanel } from "./components/RecoveryPanel";
import { RenderError } from "./scenarios/RenderError";
import { AsyncError } from "./scenarios/AsyncError";
import { NetworkError } from "./scenarios/NetworkError";
import { ChunkLoadError } from "./scenarios/ChunkLoadError";

export interface ErrorLogEntry {
  id: string;
  error: { name: string; message: string; stack?: string };
  context: ErrorContext & { boundaryName?: string };
  classified: ReturnType<typeof classifyError>;
  timestamp: number;
}

function createDemoReporter(onReport: (entry: ErrorLogEntry) => void) {
  return {
    report(error: Error, context: ErrorContext) {
      const classified = classifyError(error);
      onReport({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        error: serializeError(error) as { name: string; message: string; stack?: string },
        context: { ...context },
        classified,
        timestamp: Date.now(),
      });
    },
  };
}

function AppContent() {
  const [log, setLog] = useState<ErrorLogEntry[]>([]);
  const addLog = useCallback((entry: ErrorLogEntry) => {
    setLog((prev) => [...prev.slice(-49), entry]);
  }, []);

  const consoleReporter = useMemo(() => new ConsoleReporter("[Demo]"), []);
  const demoReporter = useMemo(() => createDemoReporter(addLog), [addLog]);
  const reporter = useMemo(
    () => ({
      report(error: Error, context: ErrorContext) {
        consoleReporter.report(error, context);
        demoReporter.report(error, context);
      },
    }),
    [consoleReporter, demoReporter]
  );

  return (
    <GlobalErrorBoundary
      reporter={reporter}
      fallback={(error, reset) => (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-900 text-zinc-100">
          <ErrorDisplay error={error} />
          <RecoveryPanel reset={reset} />
        </div>
      )}
    >
      <DemoReporterProvider reporter={reporter}>
        <ErrorHandlerProvider>
          <Layout
          sidebar={
            <nav className="flex flex-col gap-2 p-4">
              <a href="#render" className="text-cyan-400 hover:underline">Render Error</a>
              <a href="#async" className="text-cyan-400 hover:underline">Async Error</a>
              <a href="#network" className="text-cyan-400 hover:underline">Network Error</a>
              <a href="#chunk" className="text-cyan-400 hover:underline">Chunk Load Error</a>
            </nav>
          }
          main={
            <div className="p-6 space-y-12">
              <section id="render">
                <RenderError />
              </section>
              <section id="async">
                <AsyncError />
              </section>
              <section id="network">
                <NetworkError />
              </section>
              <section id="chunk">
                <ChunkLoadError />
              </section>
            </div>
          }
          errorLog={
            <div className="p-4 h-full overflow-auto">
              <h3 className="font-semibold text-zinc-300 mb-2">Error Log</h3>
              {log.length === 0 ? (
                <p className="text-zinc-500 text-sm">No errors caught yet. Trigger a scenario.</p>
              ) : (
                <ul className="space-y-3 text-xs">
                  {log.map((entry) => (
                    <li key={entry.id} className="border border-zinc-600 rounded p-2 bg-zinc-800/50">
                      <div className="text-amber-400">{entry.error.message}</div>
                      <div className="text-zinc-500 mt-1">
                        type: {entry.classified.type} · {entry.classified.userMessage}
                      </div>
                      {entry.context.boundaryName && (
                        <div className="text-zinc-500">boundary: {entry.context.boundaryName}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          }
        />
        </ErrorHandlerProvider>
      </DemoReporterProvider>
    </GlobalErrorBoundary>
  );
}

function App() {
  return <AppContent />;
}

export { App };
