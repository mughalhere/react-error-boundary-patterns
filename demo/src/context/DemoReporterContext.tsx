import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ErrorReporter } from "react-crash-guard";

const DemoReporterContext = createContext<ErrorReporter | null>(null);

export function useDemoReporter(): ErrorReporter | null {
  return useContext(DemoReporterContext);
}

export function DemoReporterProvider(props: {
  children: ReactNode;
  reporter: ErrorReporter;
}) {
  const value = useMemo(() => props.reporter, [props.reporter]);
  return (
    <DemoReporterContext.Provider value={value}>
      {props.children}
    </DemoReporterContext.Provider>
  );
}
